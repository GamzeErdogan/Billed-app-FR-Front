/**
 * @jest-environment jsdom
 */
 import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills, { handleClickNewBill } from "../containers/Bills.js";
import mockStore from "../__mocks__/store.js"

import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import userEvent from "@testing-library/user-event";
jest.mock("../app/store", () => mockStore)


const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
     
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
     
      expect(dates).toEqual(datesSorted)
    })
  })
})
//test integration Get Bills

describe('Given I am connected as an employe and I am on NewBill page', () => {
  describe('When I click on the icon eye', () => {
    test('A modal should open', async() => {
      document.body.innerHTML = BillsUI({ data: bills })
      const billsClass = new Bills({ document, onNavigate, store: mockStore, localStorage: localStorageMock })
      $.fn.modal = jest.fn()
      const iconEye = screen.getAllByTestId("icon-eye");
      const handleClickIcon = jest.fn(billsClass.handleClickIconEye)
      iconEye.forEach(icon => {
        icon.addEventListener("click", handleClickIcon(icon))
      })
      const justificatif = await waitFor(() => screen.getByText("Justificatif"));
      expect(handleClickIcon).toHaveBeenCalled();
      expect(justificatif).toBeTruthy();
    })
  })
})

describe("When an error occurs on API", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills")
    Object.defineProperty(
      window,
      'localStorage',
      { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })
  test("fetches bills from an API and fails with 404 message error", async () => {

    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"))
        }
      }
    })
    window.onNavigate(ROUTES_PATH.Dashboard)
    await new Promise(process.nextTick);
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })})