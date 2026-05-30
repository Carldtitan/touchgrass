import os
import testmu
from testmu import expect, var, set_var
from playwright.async_api import Page

testmu.configure(
    build="96836418-eb5f-4a4f-80cc-038e76c6851e",
    name="Capture Instagram Homepage Screenshots",
    tc_id="TC-3",
    network=True,
    variables={"__cp_final": "true"},
    default_action_timeout_ms=10000,
    default_navigation_timeout_ms=30000,
)

@testmu.test
async def test(page: Page):
    async with testmu.step('Navigate to https://www.instagram.com/'):
        await page.goto("https://www.instagram.com/")
    
    async with testmu.step('Waiting for Instagram homepage to finish loading'):
        await page.wait_for_timeout(800)
    
    async with testmu.step('PRIMARY: the Instagram login page is visible | HINTS: right side shows “Log into Instagram” with username and password fields Always answer true/false, nothing else.'):
        set_var('__cp_final', await testmu.vision_query(page, "PRIMARY: the Instagram login page is visible | HINTS: right side shows \u201cLog into Instagram\u201d with username and password fields Always answer true/false, nothing else.", ""))
    
    async with testmu.step('Assertion check'):
        await testmu.verify_assertion(page, 'Assertion check', {'operator': ['equals'], 'assertion_operands': [], 'left_operand': None, 'right_operand': None, 'operands': [], 'sub_results': [{'description': 'Final verification — confirm the objective is fully achieved', 'passed': True, 'operator': 'equals', 'transforms': ['strip', 'lowercase'], 'expected': 'true', 'extracted_value': '{{__cp_final}}', 'store_key': '__cp_final', 'variable_refs': {'{{__cp_final}}': 'true'}}], 'sub_checks': [{'description': 'Final verification — confirm the objective is fully achieved', 'store_key': '__cp_final', 'expected_value': 'true', 'stored_value': '{{__cp_final}}', 'operator': 'equals', 'transforms': ['strip', 'lowercase']}], 'composite_operator': 'and', 'claim': 'Go to Instagram and get screenshots of its homepage'})


if __name__ == "__main__":
    testmu.run(test)