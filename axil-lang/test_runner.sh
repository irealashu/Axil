#!/usr/bin/env bash
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPILER="${SCRIPT_DIR}/src/axilc.py"
BIN_DIR="${SCRIPT_DIR}/bin"
mkdir -p "${BIN_DIR}"

echo -e "${BOLD}${BLUE}================================================================${NC}"
echo -e "${BOLD}${CYAN}            AXIL ZERO-DEPENDENCY TEST HARNESS v1.1             ${NC}"
echo -e "${BOLD}${BLUE}================================================================${NC}"

declare -A EXPECTED_OUTPUTS
EXPECTED_OUTPUTS["01_hello.axil"]="Hello, World from Axil!"
EXPECTED_OUTPUTS["02_arithmetic.axil"]="60"
EXPECTED_OUTPUTS["03_branches.axil"]="Under 18"
EXPECTED_OUTPUTS["04_loop.axil"]="120"
EXPECTED_OUTPUTS["05_modulo.axil"]="Odd"

PASSED=0
FAILED=0

for test_file in "${SCRIPT_DIR}/examples"/*.axil; do
    test_name="$(basename "${test_file}")"
    bin_name="${BIN_DIR}/$(basename "${test_file}" .axil)"

    echo -e "\n${BOLD}--> Testing [${test_name}]${NC}"
    
    # 1. Compilation
    if python3 "${COMPILER}" "${test_file}" -o "${bin_name}"; then
        bin_size=$(wc -c < "${bin_name}")
        echo -e "    Compilation: ${GREEN}OK${NC} (${bin_size} bytes)"
    else
        echo -e "    Compilation: ${RED}FAILED${NC}"
        FAILED=$((FAILED + 1))
        continue
    fi

    # 2. Native Execution
    ACTUAL_OUTPUT="$("${bin_name}")"
    EXPECTED="${EXPECTED_OUTPUTS[${test_name}]:-}"

    TRIMMED_ACTUAL="$(echo -n "${ACTUAL_OUTPUT}" | tr -d '\r')"
    TRIMMED_EXPECTED="$(echo -n "${EXPECTED}" | tr -d '\r')"

    echo -e "    Program Output: ${CYAN}${ACTUAL_OUTPUT}${NC}"

    if [ "${TRIMMED_ACTUAL}" = "${TRIMMED_EXPECTED}" ]; then
        echo -e "    Verification:   ${GREEN}PASSED${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "    Verification:   ${RED}FAILED${NC}"
        echo -e "      Expected: '${TRIMMED_EXPECTED}'"
        echo -e "      Received: '${TRIMMED_ACTUAL}'"
        FAILED=$((FAILED + 1))
    fi
done

echo -e "\n${BOLD}${BLUE}================================================================${NC}"
echo -e "${BOLD}Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo -e "${BOLD}${BLUE}================================================================${NC}"

if [ "${FAILED}" -ne 0 ]; then
    exit 1
fi
