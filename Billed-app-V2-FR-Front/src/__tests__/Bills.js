/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../pages/Bills/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { getBills, initBillsPage } from "../pages/Bills/Bills.js";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);
jest.mock("../app/format.js", () => {
    const original = jest.requireActual("../app/format.js");
    return {
        ...original,
        formatDate: jest.fn((dateStr) => {
            if (dateStr === "invalid-date") {
                throw new Error("Invalid date");
            }
            return original.formatDate(dateStr);
        }),
    };
});

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                }),
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            expect(windowIcon).toBeTruthy();
            expect(windowIcon.classList.contains("active-icon")).toBe(true);
        });
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i,
                )
                .map((a) => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });
});

describe("Given I am on Bills page", () => {
    test("When I click on New Bill, Then it should navigate to NewBill", () => {
        document.body.innerHTML = `
          <button data-testid="btn-new-bill">Nouvelle note de frais</button>
        `;
        const onNavigate = jest.fn();

        initBillsPage({
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage,
        });

        const buttonNewBill = screen.getByTestId("btn-new-bill");
        fireEvent.click(buttonNewBill);
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    });

    test("When I click on eye icon, Then the modal should display the image", () => {
        const billUrl = "https://example.com/bill.jpg";
        document.body.innerHTML = `
          <div data-testid="icon-eye" data-bill-url="${billUrl}"></div>
          <div class="modal" id="modaleFile">
            <div class="modal-body"></div>
          </div>
        `;

        const showMock = jest.fn();
        global.bootstrap = {
            Modal: jest.fn(() => ({ show: showMock })),
        };

        initBillsPage({
            document,
            onNavigate: jest.fn(),
            store: null,
            localStorage: window.localStorage,
        });

        const iconEye = screen.getByTestId("icon-eye");
        fireEvent.click(iconEye);

        const modaleFile = document.querySelector("#modaleFile");
        modaleFile.dispatchEvent(new Event("shown.bs.modal"));

        expect(showMock).toHaveBeenCalled();
        expect(modaleFile.querySelector(".modal-body").innerHTML).toContain(
            billUrl,
        );

        delete global.bootstrap;
    });
});

describe("Given I am fetching bills", () => {
    test("When store is not provided, Then it should return an empty list", async () => {
        const data = await getBills();
        expect(data).toEqual([]);
    });

    test("When a bill has an invalid date, Then it should keep raw date", async () => {
        const store = {
            bills: () => ({
                list: () =>
                    Promise.resolve([
                        {
                            id: "test",
                            date: "invalid-date",
                            status: "pending",
                        },
                    ]),
            }),
        };

        const data = await getBills(store);
        expect(data[0].date).toBe("invalid-date");
        expect(data[0].status).toBe("En attente");
    });

    test("When the API returns an error, Then it should throw", async () => {
        const store = {
            bills: () => ({
                list: () => Promise.reject(new Error("Erreur API")),
            }),
        };

        await expect(getBills(store)).rejects.toThrow("Erreur API");
    });
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
        test("fetches bills from mock API GET", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" }),
            );

            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);

            await waitFor(() => screen.getByText("Mes notes de frais"));
            expect(screen.getByText("Mes notes de frais")).toBeTruthy();
            expect(screen.getByText("encore")).toBeTruthy();
        });
    });

    describe("When an error occurs on API", () => {
        beforeEach(() => {
            jest.spyOn(mockStore, "bills");
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" }),
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            router();
        });

        test("fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => Promise.reject(new Error("Erreur 404")),
                };
            });

            window.onNavigate(ROUTES_PATH.Bills);
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        });
    });
});
