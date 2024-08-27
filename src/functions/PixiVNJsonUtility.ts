import { PixiVNJsonConditions, PixiVNJsonLabelGet, PixiVNJsonStorageGet, PixiVNJsonUnionCondition, PixiVNJsonValueGet, PixiVNJsonValueSet } from "../interface";
import PixiVNJsonConditionalResultWithDefaultElement from "../interface/PixiVNJsonConditionalResultWithDefaultElement";
import PixiVNJsonConditionalStatements from "../interface/PixiVNJsonConditionalStatements";
import { narration, storage } from "../managers";
import NarrationManagerStatic from "../managers/NarrationManagerStatic";
import { StorageElementType } from "../types";
import { getFlag, setFlag } from "./FlagsUtility";

/**
 * Get the value from the conditional statements.
 * @param statement is the conditional statements object
 * @returns the value from the conditional statements
 */
export function getValueFromConditionalStatements<T>(statement: PixiVNJsonConditionalStatements<T> | T): T | undefined {
    if (statement && typeof statement === "object" && "type" in statement) {
        switch (statement.type) {
            case "ifelse":
                let conditionResult = getConditionResult(statement.condition)
                if (conditionResult) {
                    return getValueFromConditionalStatements(statement.then)
                } else {
                    return getValueFromConditionalStatements(statement.then)
                }
            case "stepswitch":
                let elements = getValueFromConditionalStatements(statement.elements) || []
                if (elements.length === 0) {
                    console.error("[Pixi'VN] getValueFromConditionalStatements elements.length === 0")
                    return undefined
                }
                switch (statement.choiceType) {
                    case "random":
                        let randomIndex = Math.floor(Math.random() * elements.length)
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
                }
        }
    }
    return statement
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
function getValue(value: StorageElementType | PixiVNJsonValueGet | PixiVNJsonConditions): any {
    if (value && typeof value === "object") {
        if ("type" in value) {
            if (value.type === "value" && value.storageOperationType === "get") {
                switch (value.storageType) {
                    case "storage":
                        return storage.getVariable((value as PixiVNJsonStorageGet).key)
                    case "flagStorage":
                        return getFlag((value as PixiVNJsonStorageGet).key)
                    case "label":
                        return narration.getTimesLabelOpened((value as PixiVNJsonLabelGet).label)
                }
            }
            else {
                return getConditionResult(value)
            }
        }
    }
    return value
}

/**
 * Get the result of the union condition.
 * @param condition is the union condition object
 * @returns the result of the union condition
 */
function getUnionConditionResult(condition: PixiVNJsonUnionCondition): boolean {
    if (condition.unionType === "not") {
        return !getConditionResult(condition.condition)
    }
    let result: boolean = condition.unionType === "and" ? true : false
    for (let i = 0; i < condition.conditions.length; i++) {
        result = getConditionResult(condition.conditions[i])
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
    if (value.storageType === "storage") {
        storage.setVariable(value.key, getValue(value.value))
    } else {
        setFlag(value.key, value.value)
    }
}

export function getVariableData<T>(value: PixiVNJsonConditionalStatements<PixiVNJsonConditionalResultWithDefaultElement<T>[] | PixiVNJsonConditionalResultWithDefaultElement<T>>, result: T[] = []): T[] {
    let data = getValueFromConditionalStatements(value)
    if (!data) {
        return result
    }
    if (!Array.isArray(data)) {
        data = [data]
    }
    data.forEach((element) => {
        if (element.firstItem) {
            if (!Array.isArray(element.firstItem)) {
                element.firstItem = [element.firstItem]
            }
            element.firstItem.forEach((item) => {
                result.push(item)
            })
        }
        let secondConditionalItem = element.secondConditionalItem
        if (secondConditionalItem) {
            getVariableData(secondConditionalItem, result)
        }
    })
    return result
}