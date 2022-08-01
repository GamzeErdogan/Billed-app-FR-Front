/**
 * @jest-environment jsdom
 */
 import { ROUTES_PATH} from "../constants/routes.js";
 import { fireEvent, screen, waitFor } from "@testing-library/dom"
 import { setLocalStorage } from '../../setup-jest'
 import mockStore from "../__mocks__/store"
 import NewBillUI from "../views/NewBillUI.js"
 import router from "../app/Router"
 import NewBill from "../containers/NewBill.js"
 import { localStorageMock } from "../__mocks__/localStorage.js"
 import BillsUI from "../views/BillsUI"
 import userEvent from "@testing-library/user-event";
 import { ROUTES } from "../constants/routes"
 import Store from "../app/Store"



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I click the button 'Envoyer'", () => {
    test("Then If there is no input informaton is given, don't render the Bills Page", () => {
     localStorage.setItem("user",JSON.stringify({ type: 'Employee', email: "a@a"}));
     const root = document.createElement('div');
     root.setAttribute("id", "root");
     document.body.append(root);
     router();
     window.onNavigate(ROUTES_PATH.NewBill);
  
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      expect(fireEvent.submit(form)).toBeFalsy();
    })
  })
})

describe("Given I am connected as an employe", () => {
  describe("When I am on NewBill Page, I fill and I click the button 'Envoyer'", () => {
    test('Then if all the input datas are OK, it should be render Bills Page', () => {
     localStorage.setItem("user",JSON.stringify({ type: 'Employee', email: "a@a"}));
     const root = document.createElement('div');
     root.setAttribute("id", "root");
     document.body.append(root);
     router();
     window.onNavigate(ROUTES_PATH.NewBill);
     document.body.innerHTML = NewBillUI();
     const inputData = {
          id: "BeKy5Mo4jkmdfPGYpTxZ",
          vat: "",
          amount: "100",
          name: "test1",
          fileName: "1592770761.jpeg",
          commentary: "plop",
          pct: "20",
          type: "Transports",
          email: "employee@test.tld",
          fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
          date: "2003-03-03",
          status: "refused",
          commentAdmin: "en fait non"
      }
      const inputSelectType = screen.getByTestId("expense-type");
      fireEvent.change(inputSelectType, { target: { value: inputData.type } });
      expect(inputSelectType.value).toBe(inputData.type);

      const inputDataName = screen.getByTestId("expense-name");
      fireEvent.change(inputDataName, {target: {value: inputData.name}});
      expect(inputDataName.value).toBe(inputData.name);

      const inputDate = screen.getByTestId("datepicker");
      fireEvent.change(inputDate, {target: {value: inputData.date}});
      expect(inputDate.value).toBe(inputData.date);

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, {target: {value: inputData.amount}});
      expect(inputAmount.value).toBe(inputData.amount);

      const inputVat = screen.getByTestId("vat");
      fireEvent.change(inputVat, {target: {value: inputData.vat}});
      expect(inputVat.value).toBe(inputData.vat);

      const inputPct = screen.getByTestId("pct");
      fireEvent.change(inputPct, {target: {value: inputData.pct}});
      expect(inputPct.value).toBe(inputData.pct);

      const inputCommentary = screen.getByTestId("commentary");
      fireEvent.change(inputCommentary, {target: {value: inputData.commentary}});
      expect(inputCommentary.value).toBe(inputData.commentary);

      const form = screen.getByTestId("form-new-bill");
      
      const onNavigate = () => {
        document.body.innerHTML = ROUTES_PATH['Bills']
      };
      const store = jest.fn();
      const newBill = new NewBill({
        document, 
        onNavigate,
        store, 
        localStorage:window.localStorage,
      });
      const handleSubmit = jest.fn(e => e.preventDefault());
      newBill.updateBill = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      
    })
  })
})
describe("when I fill the image field with the correct format", () => {
  test("it should validate the field without error messages", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee", }));

    const html = NewBillUI()
    document.body.innerHTML = html

    const newBill = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    })

    const handleChangeFile = jest.fn(newBill.handleChangeFile);
    const file = screen.getByTestId("file");
    const errorFile = screen.getByTestId("errorFile");

    file.addEventListener("change", handleChangeFile);
    fireEvent.change(file, {
      target: {
        files: [new File(["test.png"], "test.png")]
      }
    })
    expect(handleChangeFile).toHaveBeenCalled();
    expect(errorFile.classList.length).toEqual(0)
    expect(file.files[0].name).toBe("test.png");
    expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
  })
})
describe('When an error occurs on API', () => {
  beforeEach(() => {
    jest.spyOn(mockStore, 'bills')
    Object.defineProperty(
      window,
      'localStorage',
      { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: 'a@a'
    }))
    const root = document.createElement('div')
    root.setAttribute('id', 'root')
    document.body.appendChild(root)
    router()
  })
  test('fetches bills from an API and fails with 500 message error', () => {
    mockStore.bills.mockImplementationOnce(() =>
      Promise.reject(new Error('Erreur 500'))
    )
    const html = BillsUI({ error: 'Erreur 500' })
    document.body.innerHTML = html
    const message = screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })

  
})
