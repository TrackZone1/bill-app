/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../pages/NewBill/NewBillUI.js";
import {
    initNewBillPage,
    resetBillFileState,
} from "../pages/NewBill/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then the form should be rendered with all required fields", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;

            // Verify form is present
            expect(screen.getByTestId("form-new-bill")).toBeTruthy();

            // Verify all form fields are present
            expect(screen.getByTestId("expense-type")).toBeTruthy();
            expect(screen.getByTestId("expense-name")).toBeTruthy();
            expect(screen.getByTestId("datepicker")).toBeTruthy();
            expect(screen.getByTestId("amount")).toBeTruthy();
            expect(screen.getByTestId("vat")).toBeTruthy();
            expect(screen.getByTestId("pct")).toBeTruthy();
            expect(screen.getByTestId("commentary")).toBeTruthy();
            expect(screen.getByTestId("file")).toBeTruthy();
        });

        test("Then the submit button should be rendered", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;

            const submitButton = screen.getByText("Envoyer");
            expect(submitButton).toBeTruthy();
            expect(submitButton.type).toBe("submit");
        });

        test("Then the page title should be displayed", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;

            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
        });

        test("Then the expense type select should have all options", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;

            const expenseTypeSelect = screen.getByTestId("expense-type");
            expect(expenseTypeSelect).toBeTruthy();

            // Verify all expense type options are present
            expect(screen.getByText("Transports")).toBeTruthy();
            expect(screen.getByText("Restaurants et bars")).toBeTruthy();
            expect(screen.getByText("Hôtel et logement")).toBeTruthy();
            expect(screen.getByText("Services en ligne")).toBeTruthy();
            expect(screen.getByText("IT et électronique")).toBeTruthy();
            expect(screen.getByText("Equipement et matériel")).toBeTruthy();
            expect(screen.getByText("Fournitures de bureau")).toBeTruthy();
        });
    });
});

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
    describe("When I submit a new bill with a valid file", () => {
        test("calls the API to create and update the bill", async () => {
            resetBillFileState();
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" }),
            );

            const createBill = jest.fn().mockResolvedValue({
                fileUrl: "https://localhost:3456/images/test.jpg",
                key: "1234",
            });
            const updateBill = jest.fn().mockResolvedValue({});
            const store = {
                bills: () => ({
                    create: createBill,
                    update: updateBill,
                }),
            };

            const onNavigate = jest.fn();
            document.body.innerHTML = NewBillUI();
            initNewBillPage({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            });

            const file = new File(["test"], "test.png", { type: "image/png" });
            const fileInput = screen.getByTestId("file");
            fireEvent.change(fileInput, { target: { files: [file] } });

            await waitFor(() => expect(createBill).toHaveBeenCalled());

            fireEvent.change(screen.getByTestId("expense-name"), {
                target: { value: "Taxi" },
            });
            fireEvent.change(screen.getByTestId("amount"), {
                target: { value: "42" },
            });
            fireEvent.change(screen.getByTestId("datepicker"), {
                target: { value: "2024-01-10" },
            });
            fireEvent.change(screen.getByTestId("vat"), {
                target: { value: "10" },
            });
            fireEvent.change(screen.getByTestId("pct"), {
                target: { value: "20" },
            });
            fireEvent.change(screen.getByTestId("commentary"), {
                target: { value: "test" },
            });

            const form = screen.getByTestId("form-new-bill");
            fireEvent.submit(form);

            await waitFor(() => expect(updateBill).toHaveBeenCalled());
            expect(updateBill.mock.calls[0][0].selector).toBe("1234");
        });
    });
});
