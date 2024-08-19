import { PixiVNJsonConditions, PixiVNJsonIfElse, PixiVNJsonStorageGet, PixiVNJsonStorageSet, PixiVNJsonUnionCondition } from "../interface";
import { storage } from "../managers";
import { StorageElementType } from "../types";
import { setFlag } from "./FlagsUtility";

/**
 * Get the value from the ifElse object.
 * @param ifElse is the ifElse object
 * @returns the value of the ifElse object
 */
export function getValueFromIfElse<T>(ifElse: PixiVNJsonIfElse<T> | T): T {
    try {
        if (ifElse && typeof ifElse === "object" && "type" in ifElse && ifElse.type === "ifElse") {
            let conditionResult = getConditionResult(ifElse.condition)
            if (conditionResult) {
                if (
                    ifElse.then &&
                    typeof ifElse.then === "object" &&
                    "type" in ifElse.then &&
                    ifElse.then.type === "ifElse"
                ) {
                    return getValueFromIfElse(ifElse.then)
                } else {
                    return ifElse.then as T
                }
            } else {
                if (
                    ifElse.else &&
                    typeof ifElse.else === "object" &&
                    "type" in ifElse.else &&
                    ifElse.else.type === "ifElse"
                ) {
                    return getValueFromIfElse(ifElse.else)
                } else {
                    return ifElse.else as T
                }
            }
        }
    } catch (error) { }
    return ifElse as T
}

/**
 * Get the result of the condition.
 * @param condition is the condition object
 * @returns the result of the condition
 */
function getConditionResult(condition: PixiVNJsonConditions | PixiVNJsonUnionCondition): boolean {
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