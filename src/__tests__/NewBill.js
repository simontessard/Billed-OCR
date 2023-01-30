/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { getByTestId, getByLabelText } from "@testing-library/dom"
import { bills } from "../fixtures/bills"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockedBills from "../__mocks__/store"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should render all the inputs", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId('expense-type')).toBeTruthy()
      expect(screen.getByTestId('expense-name')).toBeTruthy()
      expect(screen.getByTestId('datepicker')).toBeTruthy()
      expect(screen.getByTestId('amount')).toBeTruthy()
      expect(screen.getByTestId('vat')).toBeTruthy()
      expect(screen.getByTestId('pct')).toBeTruthy()
      expect(screen.getByTestId('commentary')).toBeTruthy()
      expect(screen.getByTestId('file')).toBeTruthy()
    })

    test("Then I select wrong image file format", async () => {
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee', email: 'employee@test.tld',
      }))

      jest.spyOn(mockedBills, "bills")
      const store = mockedBills
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
      const testImageFile = new File(["test"], "test.gif", { type: "gif" });
      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      fireEvent.change(fileInput, { target: { files: [testImageFile] } })
      handleChangeFile({
        target: {
          files: [testImageFile],
          value: 'C:\path\test.gif',
        },
        preventDefault: function () { }
      })

      await expect(handleChangeFile).toHaveBeenCalled()
      expect(screen.getByTestId("fileErrorMsg")).toBeTruthy()
      expect(screen.getByTestId("fileErrorMsg")).not.toBe('')
    })

    describe("When I click on Submit button", () => {
      describe("If inputs are empty", () => {

        test("The form is not submitted", () => {
          document.body.innerHTML = NewBillUI();

          // All inputs are empty
          expect(screen.getByTestId('expense-name').value).toBe("")
          expect(screen.getByTestId('datepicker').value).toBe("")
          expect(screen.getByTestId('amount').value).toBe("")
          expect(screen.getByTestId('vat').value).toBe("")
          expect(screen.getByTestId('pct').value).toBe("")
          expect(screen.getByTestId('commentary').value).toBe("")
          expect(screen.getByTestId('file').value).toBe("")

          const formNewBill = screen.getByTestId("form-new-bill")
          const handleSubmit = jest.fn((e) => e.preventDefault())

          formNewBill.addEventListener("submit", handleSubmit)
          fireEvent.submit(formNewBill);
          expect(screen.getByTestId("form-new-bill")).toBeTruthy()
          // expect(window.location.pathname).toBe("#employee/bill/new")
        })
      })

      describe("If fields are filled and correct", () => {

        test("It should redirect to Bills page", async () => {
          document.body.innerHTML = NewBillUI()

          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee', email: 'employee@test.tld',
          }))

          jest.spyOn(mockedBills, "bills")
          const store = mockedBills
          const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
          const testImageFile = new File(["test"], "test.png", { type: "image/png" });
          const fileInput = screen.getByTestId('file')

          screen.getByTestId('expense-type').value = "Transports"
          screen.getByTestId('expense-name').value = "Vol de Test Rennes Nantes"
          screen.getByTestId('datepicker').value = "2012-07-14"
          screen.getByTestId('amount').value = 800
          screen.getByTestId('vat').value = 80
          screen.getByTestId('pct').value = 40
          screen.getByTestId('commentary').value = "Commentaire de test"

          const handleChangeFile = jest.fn(newBill.handleChangeFile)
          fireEvent.change(fileInput, { target: { files: [testImageFile] } })
          handleChangeFile({
            target: {
              files: [testImageFile],
              value: 'C:\path\test.png',
            },
            preventDefault: function () { }
          })

          const formNewBill = screen.getByTestId("form-new-bill");
          const handleSubmit = jest.fn((e) => e.preventDefault());
          await expect(handleChangeFile).toHaveBeenCalled()
          formNewBill.addEventListener("submit", handleSubmit);
          fireEvent.submit(formNewBill);
          expect(screen.getByText("Mes notes de frais")).toBeTruthy()
        })
      })
    })
  })
})
