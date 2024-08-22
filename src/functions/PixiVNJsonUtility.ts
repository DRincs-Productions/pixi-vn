import { PixiVNJsonConditions, PixiVNJsonStorageGet, PixiVNJsonStorageSet, PixiVNJsonUnionCondition } from "../interface";
import PixiVNJsonConditionalStatements from "../interface/PixiVNJsonConditionalStatements";
import { narration, storage } from "../managers";
import { StorageElementType } from "../types";
import { setFlag } from "./FlagsUtility";

/**
 * Get the value from the conditional statements.
 * @param statement is the conditional statements object
 * @returns the value from the conditional statements
 */
export function getValueFromConditionalStatements<T>(statement: PixiVNJsonConditionalStatements<T> | T): T | undefined {
    if (statement && typeof statement === "object" && "type" in statement) {
        if (statement.type === "ifelse") {
            let conditionResult = getConditionResult(statement.condition)
            if (conditionResult) {
                return getValueFromConditionalStatements(statement.then)
            } else {
                return getValueFromConditionalStatements(statement.then)
            }
        }
        else if (statement.type === "stepswitch") {
            let elements = getValueFromConditionalStatements(statement.elements) || []
            if (elements.length === 0) {
                console.error("[Pixi'VN] getValueFromConditionalStatements elements.length === 0")
                return undefined
            }
            if (statement.choiceType === "random") {
                let randomIndex = Math.floor(Math.random() * elements.length)
                return getValueFromConditionalStatements(elements[randomIndex])
            }
            else if (statement.choiceType === "loop") {
                if (narration.currentStepTimesCounter > elements.length - 1) {
                    narration.currentStepTimesCounter = 0
                    return getValueFromConditionalStatements(elements[0])
                }
                return getValueFromConditionalStatements(elements[narration.currentStepTimesCounter])
            }
            else if (statement.choiceType === "sequential") {
                let end: T | undefined = undefined
                if (statement.end == "lastItem") {
                    end = getValueFromConditionalStatements(elements[elements.length - 1])
                }
                if (narration.currentStepTimesCounter > elements.length - 1) {
                    return end
                }
                return getValueFromConditionalStatements(elements[narration.currentStepTimesCounter])
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
    let result = false
    switch (condition.type) {
        case "compare":
            let leftValue: string = getValueToString(condition.leftValue)
            let rightValue: string = getValueToString(condition.rightValue)
            switch (condition.operator) {
                case "==":
                    result = leftValue === rightValue
                    break
                case "!=":
                    result = leftValue !== rightValue
                    break
                case "<":
                    result = leftValue < rightValue
                    break
                case "<=":
                    result = leftValue <= rightValue
                    break
                case ">":
                    result = leftValue > rightValue
                    break
                case ">=":
                    result = leftValue >= rightValue
                    break
            }
            break
        case "valueCondition":
            result = getValue(condition.value) ? true : false
            break
        case "union":
            result = getUnionConditionResult(condition)
            break
        case "labelcondition":
            switch (condition.operator) {
                case "started":
                    result = narration.isLabelAlreadyStarted(condition.label)
                    break
                case "completed":
                    result = narration.isLabelAlreadyCompleted(condition.label)
                    break
            }
            break
    }
    return result
}

/**
 * Get the value to string.
 * @param value is the value to convert to string
 * @returns the value to string
 */
function getValueToString(value: StorageElementType | PixiVNJsonStorageGet): string {
    let newValue = getValue(value)
    if (typeof newValue === "string") {
        return newValue
    }
    if (typeof newValue === "object") {
        return JSON.stringify(newValue)
    }
    return newValue.toString()
}

/**
 * Get the value from the storage or the value.
 * @param value is the value to get
 * @returns the value from the storage or the value
 */
function getValue(value: StorageElementType | PixiVNJsonStorageGet): any {
    if (value && typeof value === "object") {
        if ("type" in value) {
            if (value.storageOperationType === "get") {
                return storage.getVariable((value as PixiVNJsonStorageGet).key)
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

export function setStorageJson(value: PixiVNJsonStorageSet) {
    if (value.storageType === "storage") {
        storage.setVariable(value.key, getValue(value.value))
    } else {
        setFlag(value.key, value.value)
    }
}