defmodule AnotagastoWeb.ExpenseJSON do
  alias Anotagasto.Expenses.Expense

  @doc """
  Renders a list of expenses.
  """
  def index(%{entries: entries, page: page, page_size: page_size, total: total, total_pages: total_pages, amount_total: amount_total}) do
    %{
      data: for(expense <- entries, do: data(expense)),
      pagination: %{page: page, page_size: page_size, total: total, total_pages: total_pages},
      amount_total: amount_total
    }
  end

  @doc """
  Renders a single expense.
  """
  def show(%{expense: expense}) do
    %{data: data(expense)}
  end

  defp data(%Expense{} = expense) do
    %{
      id: expense.id,
      value: expense.value,
      description: expense.description,
      category: expense.category,
      user_id: expense.user_id,
      date: expense.date
    }
  end
end
