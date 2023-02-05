/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {

      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe("When I am on Bills Page", () => {
    test("The page should not be empty", async () => {

      document.body.innerHTML = BillsUI({ data: bills })
      const body = await screen.getByTestId('tbody')
      expect(body).toBeDefined()
    })
    describe('When I click on the new bill button', () => {
      test('I must be redirected to New Bill Page', () => {
        document.body.innerHTML = BillsUI({ data: bills })

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bill = new Bills({ document, onNavigate, store, localStorage: window.localStorage })

        const handleClickButton = jest.fn(bill.handleClickNewBill)
        const newBillButton = screen.getByTestId('btn-new-bill')
        newBillButton.addEventListener('click', handleClickButton)
        userEvent.click(newBillButton)
        expect(handleClickButton).toHaveBeenCalled()
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
      })
    })
    describe('When I click on the icon eye', () => {
      test('A modal should open', () => {
        document.body.innerHTML = BillsUI({ data: bills })

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bill = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })

        const handleClickIconEye = jest.fn(bill.handleClickIconEye)
        const iconEye = screen.getAllByTestId('icon-eye')[0]
        iconEye.addEventListener('click', handleClickIconEye(iconEye))
        userEvent.click(iconEye)
        expect(handleClickIconEye).toHaveBeenCalled()
      })
    })
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
      expect(windowIcon.className).toBe('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {

      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      document.body.innerHTML = ''
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Accepté"))
      const contentPending  = await screen.getByText("En attente")
      expect(contentPending).toBeTruthy()
      const contentRefused  = await screen.getAllByText("Refused")
      expect(contentRefused).toBeTruthy()
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
  })
})
