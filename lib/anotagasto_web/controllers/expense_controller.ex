defmodule AnotagastoWeb.ExpenseController do
  use AnotagastoWeb, :controller

  alias Anotagasto.Expenses
  alias Anotagasto.Expenses.Expense
  alias Anotagasto.Expenses.Filters
  alias Anotagasto.Pagination

  action_fallback AnotagastoWeb.FallbackController

  def index(conn, params) do
    user = conn.assigns.user

    with {:ok, pagination} <- Pagination.build(params),
         {:ok, filters} <- Filters.build(params) do
      result = Expenses.list_expenses_by_user(user.id, pagination, filters)
      render(conn, :index, result)
    end
  end

  def create(conn, params) do
    user = conn.assigns.user
    params = Map.put(params, "user_id", user.id)

    with {:ok, _} <- Expense.valid?(params),
         {:ok, %Expense{} = expense} <- Expenses.create_expense(params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/expenses/#{expense}")
      |> render(:show, expense: expense)
    end
  end

  def show(conn, %{"id" => id}) do
    expense = Expenses.get_expense!(id)
    render(conn, :show, expense: expense)
  end

  def update(conn, %{"id" => id, "expense" => expense_params}) do
    expense = Expenses.get_expense!(id)

    with {:ok, %Expense{} = expense} <- Expenses.update_expense(expense, expense_params) do
      render(conn, :show, expense: expense)
    end
  end

  def delete(conn, %{"id" => id}) do
    expense = Expenses.get_expense!(id)

    with {:ok, %Expense{}} <- Expenses.delete_expense(expense) do
      send_resp(conn, :no_content, "")
    end
  end
end
