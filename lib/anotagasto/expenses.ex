defmodule Anotagasto.Expenses do
  @moduledoc """
  The Expenses context.
  """

  import Ecto.Query, warn: false
  alias Anotagasto.Expenses
  alias Anotagasto.Repo

  alias Anotagasto.Expenses.Expense
  alias Anotagasto.Expenses.Filters

  def list_expenses_by_user(user_id, %Anotagasto.Pagination{} = pagination, %Filters{} = filters \\ %Filters{}) do
    Expenses.Repo.list_expenses_by_user(user_id, pagination, filters)
  end

  def get_expense!(id), do: Repo.get!(Expense, id)

  def create_expense(attrs) do
    %Expense{}
    |> Expense.changeset(attrs)
    |> Repo.insert()
  end

  def update_expense(%Expense{} = expense, attrs) do
    expense
    |> Expense.changeset(attrs)
    |> Repo.update()
  end

  def delete_expense(%Expense{} = expense) do
    Repo.delete(expense)
  end

  def change_expense(%Expense{} = expense, attrs \\ %{}) do
    Expense.changeset(expense, attrs)
  end
end
