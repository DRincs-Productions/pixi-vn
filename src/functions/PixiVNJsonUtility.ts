import { PixiVNJsonConditions, PixiVNJsonLabelGet, PixiVNJsonStorageGet, PixiVNJsonUnionCondition, PixiVNJsonValueGet, PixiVNJsonValueSet } from "../interface";
import PixiVNJsonConditionalStatements from "../interface/PixiVNJsonConditionalStatements";
import { narration, storage } from "../managers";
import { StorageElementType } from "../types";
import { getFlag, setFlag } from "./FlagsUtility";

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
                        return narration.isLabelAlreadyStarted(condition.label as string)
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