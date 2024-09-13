import { PixiVNJsonConditions, PixiVNJsonLabelGet, PixiVNJsonLabelStep, PixiVNJsonStorageGet, PixiVNJsonUnionCondition, PixiVNJsonValueGet, PixiVNJsonValueSet } from "../interface";
import PixiVNJsonArithmeticOperations from "../interface/PixiVNJsonArithmeticOperations";
import PixiVNJsonConditionalResultToCombine from "../interface/PixiVNJsonConditionalResultToCombine";
import PixiVNJsonConditionalStatements from "../interface/PixiVNJsonConditionalStatements";
import { PixiVNJsonLogicGet } from "../interface/PixiVNJsonValue";
import { narration, storage } from "../managers";
import NarrationManagerStatic from "../managers/NarrationManagerStatic";
import StorageManagerStatic from "../managers/StorageManagerStatic";
import { StorageElementType } from "../types";
import { getFlag, setFlag } from "./FlagsUtility";

function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Get the value from the conditional statements.
 * @param statement is the conditional statements object
 * @returns the value from the conditional statements
 */
export function getValueFromConditionalStatements<T>(statement: PixiVNJsonConditionalResultToCombine<T> | PixiVNJsonConditionalStatements<T> | T | undefined): T | undefined {
    if (Array.isArray(statement) || !statement) {
        return undefined
    }
    else if (statement && typeof statement === "object" && "type" in statement) {
        switch (statement.type) {
            case "resulttocombine":
                return combinateResult(statement)
            case "ifelse":
                let conditionResult = geLogichValue<boolean>(statement.condition)
                if (conditionResult) {
                    return getValueFromConditionalStatements(statement.then)
                } else {
                    return getValueFromConditionalStatements(statement.else)
                }
            case "stepswitch":
                let elements = getValueFromConditionalStatements(statement.elements) || []
                if (elements.length === 0) {
                    console.error("[Pixi'VN] getValueFromConditionalStatements elements.length === 0")
                    return undefined
                }
                switch (statement.choiceType) {
                    case "random":
                        let randomIndex = randomIntFromInterval(0, elements.length)
                        return getValueFromConditionalStatements(elements[randomIndex])
                    case "loop":
                        if (narration.currentStepTimesCounter > elements.length - 1) {
                            narration.currentStepTimesCounter = 0
                            return getValueFromConditionalStatements(elements[0])
                        }
                        return getValueFromConditionalStatements(elements[NarrationManagerStatic.getCurrentStepTimesCounter(statement.nestedId)])
                    case "sequential":
                        let end: T | undefined = undefined
                        if (statement.end == "lastItem") {
                            end = getValueFromConditionalStatements(elements[elements.length - 1])
                        }
                        if (narration.currentStepTimesCounter > elements.length - 1) {
                            return end
                        }
                        return getValueFromConditionalStatements(elements[NarrationManagerStatic.getCurrentStepTimesCounter(statement.nestedId)])
                    case "sequentialrandom":
                        let randomIndexWhitExclude = NarrationManagerStatic.getRandomNumber(0, elements.length, {
                            nestedId: statement.nestedId,
                            onceonly: true
                        })
                        let endSequentialRandom: T | undefined = undefined

                }
        }
    }
    return statement
}
function combinateResult<T>(value: PixiVNJsonConditionalResultToCombine<T>): undefined | T {
    let first = value.firstItem
    let second: T[] = []
    value.secondConditionalItem?.forEach((item) => {
        if (!Array.isArray(item)) {
            let i = getValueFromConditionalStatements(item)
            if (i) {
                second.push(i)
            }
        }
        else {
            item.forEach((i) => {
                let j = getValueFromConditionalStatements(i)
                if (j) {
                    second.push(j)
                }
            })
        }
    })
    let toCheck = first ? [first, ...second] : second
    if (toCheck.length === 0) {
        return undefined
    }

    if (typeof toCheck[0] === "string") {
        return toCheck.join("") as T
    }
    if (typeof toCheck[0] === "object") {
        let steps = toCheck as PixiVNJsonLabelStep[]
        let dialogue = steps.map((step) => step.dialogue).join("")
        let end = steps.find((step) => step.end)
        let choices = steps.find((step) => step.choices)
        let glueEnabled = steps.find((step) => step.glueEnabled)
        let goNextStep = steps.find((step) => step.goNextStep)
        let labelToOpen = steps.find((step) => step.labelToOpen)
        let operation = steps.find((step) => step.operation)

        let res: PixiVNJsonLabelStep = {
            dialogue,
            end: end?.end,
            choices: choices?.choices,
            glueEnabled: glueEnabled?.glueEnabled,
            goNextStep: goNextStep?.goNextStep,
            labelToOpen: labelToOpen?.labelToOpen,
            operation: operation?.operation
        }
        return res as T
    }
}

/**
 * Get the result of the condition.
 * @param condition is the condition object
 * @returns the result of the condition
 */
function getConditionResult(condition: PixiVNJsonConditions): boolean {
    if (!condition) {
        return false
    }
    if (typeof condition !== "object" || !("type" in condition)) {
        if (condition) {
            return true
        }
        return false
    }
    switch (condition.type) {
        case "compare":
            let leftValue = getValue(condition.leftValue)
            let rightValue = getValue(condition.rightValue)
            switch (condition.operator) {
                case "==":
                    return leftValue === rightValue
                case "!=":
                    return leftValue !== rightValue
                case "<":
                    return leftValue < rightValue
                case "<=":
                    return leftValue <= rightValue
                case ">":
                    return leftValue > rightValue
                case ">=":
                    return leftValue >= rightValue
                case "CONTAINS":
                    return leftValue.toString().includes(rightValue.toString())
            }
            break
        case "valueCondition":
            return getValue(condition.value) ? true : false
        case "union":
            return getUnionConditionResult(condition as PixiVNJsonUnionCondition)
        case "labelcondition":
            if ("operator" in condition && "label" in condition) {
                switch (condition.operator) {
                    case "started":
                        return narration.getTimesLabelOpened(condition.label as string) > 0
                    case "completed":
                        return narration.isLabelAlreadyCompleted(condition.label as string)
                }
            }
            break
    }
    if (condition) {
        return true
    }
    return false
}

/**
 * Get the value from the storage or the value.
 * @param value is the value to get
 * @returns the value from the storage or the value
 */
export function getValue<T = any>(value: StorageElementType | PixiVNJsonValueGet | PixiVNJsonConditions): T | undefined {
    if (value && typeof value === "object") {
        if ("type" in value) {
            if (value.type === "value" && value.storageOperationType === "get") {
                switch (value.storageType) {
                    case "storage":
                        return storage.getVariable((value as PixiVNJsonStorageGet).key) as unknown as T
                    case "tempstorage":
                        return StorageManagerStatic.getTempVariable((value as PixiVNJsonStorageGet).key) as unknown as T
                    case "flagStorage":
                        return getFlag((value as PixiVNJsonStorageGet).key) as unknown as T
                    case "label":
                        return narration.getTimesLabelOpened((value as PixiVNJsonLabelGet).label) as unknown as T
                    case "logic":
                        return geLogichValue((value as PixiVNJsonLogicGet).operation) as unknown as T
                }
            }
            else {
                return geLogichValue<T>(value)
            }
        }
    }
    return value as T
}

/**
 * Get the result of the union condition.
 * @param condition is the union condition object
 * @returns the result of the union condition
 */
function getUnionConditionResult(condition: PixiVNJsonUnionCondition): boolean {
    if (condition.unionType === "not") {
        return !geLogichValue<boolean>(condition.condition)
    }
    let result: boolean = condition.unionType === "and" ? true : false
    for (let i = 0; i < condition.conditions.length; i++) {
        result = geLogichValue<boolean>(condition.conditions[i]) || false
        if (condition.unionType === "and") {
            if (!result) {
                return false
            }
        } else {
            if (result) {
                return true
            }
        }
    }
    return result
}

export function setStorageJson(value: PixiVNJsonValueSet) {
    let v = getValueFromConditionalStatements(value.value)
    let valueToSet: StorageElementType
    if (v && typeof v === "object" && "type" in v) {
        valueToSet = geLogichValue<StorageElementType>(v)
    }
    else {
        valueToSet = v
    }
    switch (value.storageType) {
        case "flagStorage":
            setFlag(value.key, value.value)
            break
        case "storage":
            storage.setVariable(value.key, valueToSet)
            break
        case "tempstorage":
            StorageManagerStatic.setTempVariable(value.key, valueToSet)
            break
    }
}

function geLogichValue<T = StorageElementType>(value: T | PixiVNJsonValueGet | PixiVNJsonArithmeticOperations | PixiVNJsonConditions | PixiVNJsonConditionalStatements<T | PixiVNJsonValueGet | PixiVNJsonArithmeticOperations | PixiVNJsonConditions>): T | undefined {
    let v = getValueFromConditionalStatements<T | PixiVNJsonValueGet | PixiVNJsonArithmeticOperations | PixiVNJsonConditions>(value)
    if (
        v && typeof v === "object" && "type" in v
    ) {
        switch (v.type) {
            case "value":
                return getValue<T>(v)
            case "arithmetic":
            case "arithmeticsingle":
                return getValueFromArithmeticOperations(v as PixiVNJsonArithmeticOperations)
            case "compare":
            case "valueCondition":
            case "union":
            case "labelcondition":
                return getConditionResult(v) as T
        }
    }
    return v as T
}
function getValueFromArithmeticOperations<T = StorageElementType>(operation: PixiVNJsonArithmeticOperations): T | undefined {
    let leftValue = geLogichValue(operation.leftValue)
    switch (operation.type) {
        case "arithmetic":
            let rightValue = geLogichValue(operation.rightValue)
            switch (operation.operator) {
                case "*":
                    return (leftValue as any) * (rightValue as any) as T
                case "/":
                    return (leftValue as any) / (rightValue as any) as T
                case "+":
                    return (leftValue as any) + (rightValue as any) as T
                case "-":
                    return (leftValue as any) - (rightValue as any) as T
                case "%":
                    return (leftValue as any) % (rightValue as any) as T
                case "POW":
                    return Math.pow(leftValue as any, rightValue as any) as T
                case "RANDOM":
                    return Math.floor(Math.random() * ((rightValue as any) - (leftValue as any) + 1)) + (leftValue as any)
            }
        case "arithmeticsingle":
            switch (operation.operator) {
                case "INT":
                    return parseInt(leftValue as any) as T
                case "FLOOR":
                    return Math.floor(leftValue as any) as T
                case "FLOAT":
                    return parseFloat(leftValue as any) as T
            }
            break
    }
}