#!/bin/bash

PASSED=0
FAILED=0

OK=0
FAIL=1

# *** Test Lib ***
# Try to use natural language

test_case() {
    local TEST=$1
    local OPERAND=$2
    local EXPECTED=$(echo "$3")
    local VALUE=$($TEST)

    case $OPERAND in
        returns)
            if [[ "$VALUE" != "$EXPECTED" ]]; then
                echo "FAIL: $TEST: $VALUE != $EXPECTED"
                ((FAILED++))
                return 1
            fi
            ;;
        *)
            echo "Unknown operand: $OPERAND"
            return 1
    esac
    ((PASSED++))
}


show_summary() {
    echo ""
    echo "------------------------------"
    echo "TOTAL: $((PASSED+FAILED)), PASSED: $PASSED, FAILED: $FAILED"
    echo ""

    if [[ $FAILED -eq 0 ]]; then
        echo "*** PASSED ***"
        echo ""
        return 0
    else
        echo "*** FAILED ***"
        echo ""
        return 1
    fi
}

# *** Test Cases ***

too_many_connections_are_rejected() {
    ftp -aV4o /dev/null ftp://localhost:1337/1.txt > /dev/null 2>&1 && echo OK1 || echo FAIL1 &
    sleep 0.1
    ftp -aV4o /dev/null ftp://localhost:1337/1.txt > /dev/null 2>&1 && echo OK2 || echo FAIL2 &
    sleep 0.1
    ftp -aV4o /dev/null ftp://localhost:1337/1.txt > /dev/null 2>&1 && echo OK3 || echo FAIL3 &
}

connections_are_released_ok() {
    ftp -aV4o /dev/null ftp://localhost:1337/1.txt > /dev/null 2>&1 && echo OK1 || echo FAIL1 &
    sleep 0.1
    ftp -aV4o /dev/null ftp://localhost:1337/1.txt > /dev/null 2>&1 && echo OK2 || echo FAIL2 &
    sleep 1
    ftp -aV4o /dev/null ftp://localhost:1337/1.txt > /dev/null 2>&1 && echo OK3 || echo FAIL3 &
}

test_case 'too_many_connections_are_rejected' returns 'FAIL3\nOK1\nOK2'
test_case 'connections_are_released_ok' returns 'OK1\nOK2\nOK3'

show_summary
