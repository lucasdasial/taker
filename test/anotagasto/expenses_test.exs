defmodule Anotagasto.ExpensesTest do
  use Anotagasto.DataCase

  alias Anotagasto.Expenses

  describe "expenses" do
    alias Anotagasto.Expenses.Expense

    import Anotagasto.ExpensesFixtures

    @invalid_attrs %{value: nil, description: nil, category: nil, user_id: nil}

    test "list_expenses_by_user/3 returns expenses for user" do
      expense = expense_fixture()
      {:ok, pagination} = Anotagasto.Pagination.build(%{})
      {:ok, filters} = Anotagasto.Expenses.Filters.build(%{})
      result = Expenses.list_expenses_by_user(expense.user_id, pagination, filters)
      assert result.data == [expense]
    end

    test "get_expense!/1 returns the expense with given id" do
      expense = expense_fixture()
      assert Expenses.get_expense!(expense.id) == expense
    end

    test "create_expense/1 with valid data creates a expense" do
      valid_attrs = %{
        value: 42,
        description: "some description",
        category: :food,
        user_id: "7488a646-e31f-11e4-aace-600308960662"
      }

      assert {:ok, %Expense{} = expense} = Expenses.create_expense(valid_attrs)
      assert expense.value == 42
      assert expense.description == "some description"
      assert expense.category == :food
      assert expense.user_id == "7488a646-e31f-11e4-aace-600308960662"
    end

    test "create_expense/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Expenses.create_expense(@invalid_attrs)
    end

    test "update_expense/2 with valid data updates the expense" do
      expense = expense_fixture()

      update_attrs = %{
        value: 43,
        description: "some updated description",
        category: :eat_out,
        user_id: "7488a646-e31f-11e4-aace-600308960668"
      }

      assert {:ok, %Expense{} = expense} = Expenses.update_expense(expense, update_attrs)
      assert expense.value == 43
      assert expense.description == "some updated description"
      assert expense.category == :eat_out
      assert expense.user_id == "7488a646-e31f-11e4-aace-600308960668"
    end

    test "update_expense/2 with invalid data returns error changeset" do
      expense = expense_fixture()
      assert {:error, %Ecto.Changeset{}} = Expenses.update_expense(expense, @invalid_attrs)
      assert expense == Expenses.get_expense!(expense.id)
    end

    test "delete_expense/1 deletes the expense" do
      expense = expense_fixture()
      assert {:ok, %Expense{}} = Expenses.delete_expense(expense)
      assert_raise Ecto.NoResultsError, fn -> Expenses.get_expense!(expense.id) end
    end

    test "change_expense/1 returns a expense changeset" do
      expense = expense_fixture()
      assert %Ecto.Changeset{} = Expenses.change_expense(expense)
    end
  end
end
