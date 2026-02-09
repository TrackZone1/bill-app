/**
 * @jest-environment jsdom
 */

import LoginUI from "../pages/Login/LoginUI";
import { initLoginPage } from "../pages/Login/Login.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";

// --- Helper Functions ---

const setupLocalStorage = () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.clear();
};

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
};

// ------------------------

describe("Given that I am a user on login page", () => {
    beforeEach(() => {
        setupLocalStorage();
        document.body.innerHTML = LoginUI();
    });

    describe("When I do not fill fields and I click on employee button Login In", () => {
        test("Then It should renders Login page", () => {
            const inputEmailUser = screen.getByTestId("employee-email-input");
            expect(inputEmailUser.value).toBe("");

            const inputPasswordUser = screen.getByTestId(
                "employee-password-input",
            );
            expect(inputPasswordUser.value).toBe("");

            const form = screen.getByTestId("form-employee");
            const handleSubmit = jest.fn((e) => e.preventDefault());

            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);
            expect(screen.getByTestId("form-employee")).toBeTruthy();
        });
    });

    describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
        test("Then It should renders Login page", () => {
            const inputEmailUser = screen.getByTestId("employee-email-input");
            fireEvent.change(inputEmailUser, {
                target: { value: "pasunemail" },
            });
            expect(inputEmailUser.value).toBe("pasunemail");

            const inputPasswordUser = screen.getByTestId(
                "employee-password-input",
            );
            fireEvent.change(inputPasswordUser, {
                target: { value: "azerty" },
            });
            expect(inputPasswordUser.value).toBe("azerty");

            const form = screen.getByTestId("form-employee");
            const handleSubmit = jest.fn((e) => e.preventDefault());

            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);
            expect(screen.getByTestId("form-employee")).toBeTruthy();
        });
    });

    describe("When I do fill fields in correct format and I click on employee button Login In", () => {
        test("Then I should be identified as an Employee in app and redirected to Bills page", async () => {
            const inputData = {
                email: "johndoe@email.com",
                password: "azerty",
            };

            const inputEmailUser = screen.getByTestId("employee-email-input");
            fireEvent.change(inputEmailUser, {
                target: { value: inputData.email },
            });
            expect(inputEmailUser.value).toBe(inputData.email);

            const inputPasswordUser = screen.getByTestId(
                "employee-password-input",
            );
            fireEvent.change(inputPasswordUser, {
                target: { value: inputData.password },
            });
            expect(inputPasswordUser.value).toBe(inputData.password);

            const form = screen.getByTestId("form-employee");

            // Mock store with login method
            const store = {
                login: jest.fn().mockResolvedValue({ jwt: "fake-jwt" }),
                users: () => ({
                    create: jest.fn().mockResolvedValue({}),
                }),
            };

            // Initialize the login page with functional approach
            initLoginPage({
                document,
                localStorage: window.localStorage,
                onNavigate,
                store,
            });

            fireEvent.submit(form);

            // Wait for navigation and verify the result
            await waitFor(() =>
                expect(screen.getByText("Mes notes de frais")).toBeTruthy(),
            );
        });
    });

    describe("When I do fill fields in correct format and login fails", () => {
        test("Then the user should be created and redirected to Bills", async () => {
            const inputData = {
                email: "johndoe@email.com",
                password: "azerty",
            };

            const inputEmailUser = screen.getByTestId("employee-email-input");
            fireEvent.change(inputEmailUser, {
                target: { value: inputData.email },
            });

            const inputPasswordUser = screen.getByTestId(
                "employee-password-input",
            );
            fireEvent.change(inputPasswordUser, {
                target: { value: inputData.password },
            });

            const form = screen.getByTestId("form-employee");
            const onNavigateMock = jest.fn();

            const createMock = jest.fn().mockResolvedValue({});
            const store = {
                login: jest
                    .fn()
                    .mockRejectedValueOnce(new Error("User not found"))
                    .mockResolvedValue({ jwt: "fake-jwt" }),
                users: () => ({
                    create: createMock,
                }),
            };

            initLoginPage({
                document,
                localStorage: window.localStorage,
                onNavigate: onNavigateMock,
                store,
            });

            fireEvent.submit(form);

            await waitFor(() =>
                expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH.Bills),
            );
            expect(createMock).toHaveBeenCalled();
        });
    });
});

describe("Given that I am a user on login page", () => {
    beforeEach(() => {
        setupLocalStorage();
        document.body.innerHTML = LoginUI();
    });

    describe("When I do not fill fields and I click on admin button Login In", () => {
        test("Then It should renders Login page", () => {
            const inputEmailUser = screen.getByTestId("admin-email-input");
            expect(inputEmailUser.value).toBe("");

            const inputPasswordUser = screen.getByTestId(
                "admin-password-input",
            );
            expect(inputPasswordUser.value).toBe("");

            const form = screen.getByTestId("form-admin");
            const handleSubmit = jest.fn((e) => e.preventDefault());

            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);
            expect(screen.getByTestId("form-admin")).toBeTruthy();
        });
    });

    describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
        test("Then it should renders Login page", () => {
            const inputEmailUser = screen.getByTestId("admin-email-input");
            fireEvent.change(inputEmailUser, {
                target: { value: "pasunemail" },
            });
            expect(inputEmailUser.value).toBe("pasunemail");

            const inputPasswordUser = screen.getByTestId(
                "admin-password-input",
            );
            fireEvent.change(inputPasswordUser, {
                target: { value: "azerty" },
            });
            expect(inputPasswordUser.value).toBe("azerty");

            const form = screen.getByTestId("form-admin");
            const handleSubmit = jest.fn((e) => e.preventDefault());

            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);
            expect(screen.getByTestId("form-admin")).toBeTruthy();
        });
    });

    describe("When I do fill fields in correct format and I click on admin button Login In", () => {
        test("Then I should be identified as an HR admin in app and redirected to Dashboard", async () => {
            const inputData = {
                type: "Admin",
                email: "johndoe@email.com",
                password: "azerty",
                status: "connected",
            };

            const inputEmailUser = screen.getByTestId("admin-email-input");
            fireEvent.change(inputEmailUser, {
                target: { value: inputData.email },
            });
            expect(inputEmailUser.value).toBe(inputData.email);

            const inputPasswordUser = screen.getByTestId(
                "admin-password-input",
            );
            fireEvent.change(inputPasswordUser, {
                target: { value: inputData.password },
            });
            expect(inputPasswordUser.value).toBe(inputData.password);

            const form = screen.getByTestId("form-admin");

            // Mock store with login method
            const store = {
                login: jest.fn().mockResolvedValue({ jwt: "fake-jwt" }),
                users: () => ({
                    create: jest.fn().mockResolvedValue({}),
                }),
            };

            // Initialize the login page with functional approach
            initLoginPage({
                document,
                localStorage: window.localStorage,
                onNavigate,
                store,
            });

            fireEvent.submit(form);

            // Integration Check: Wait for redirection
            await waitFor(() =>
                expect(screen.getByText("Validations")).toBeTruthy(),
            );
        });
    });

    describe("When I do fill fields in correct format and login fails", () => {
        test("Then createUser should be called and I should still be redirected to Dashboard", async () => {
            const inputEmailUser = screen.getByTestId("admin-email-input");
            fireEvent.change(inputEmailUser, {
                target: { value: "newadmin@email.com" },
            });

            const inputPasswordUser = screen.getByTestId(
                "admin-password-input",
            );
            fireEvent.change(inputPasswordUser, {
                target: { value: "azerty" },
            });

            const form = screen.getByTestId("form-admin");

            const createMock = jest.fn().mockResolvedValue({});
            const store = {
                login: jest
                    .fn()
                    .mockRejectedValueOnce(new Error("User not found"))
                    .mockResolvedValue({ jwt: "fake-jwt" }),
                users: () => ({
                    create: createMock,
                }),
            };

            initLoginPage({
                document,
                localStorage: window.localStorage,
                onNavigate,
                store,
            });

            fireEvent.submit(form);

            await waitFor(() =>
                expect(screen.getByText("Validations")).toBeTruthy(),
            );
            expect(createMock).toHaveBeenCalled();
        });
    });

    describe("When I submit admin form without a store", () => {
        test("Then I should still be redirected to Dashboard", async () => {
            const inputEmailUser = screen.getByTestId("admin-email-input");
            fireEvent.change(inputEmailUser, {
                target: { value: "admin@email.com" },
            });

            const inputPasswordUser = screen.getByTestId(
                "admin-password-input",
            );
            fireEvent.change(inputPasswordUser, {
                target: { value: "azerty" },
            });

            const form = screen.getByTestId("form-admin");

            initLoginPage({
                document,
                localStorage: window.localStorage,
                onNavigate,
                store: null,
            });

            fireEvent.submit(form);

            await waitFor(() =>
                expect(screen.getByText("Validations")).toBeTruthy(),
            );
        });
    });
});
