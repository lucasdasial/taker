defmodule Anotagasto.Expenses.Repo do
  import Ecto.Query

  alias Anotagasto.Expenses.Expense
  alias Anotagasto.Expenses.Filters
  alias Anotagasto.Pagination
  alias Anotagasto.Repo

  def list_expenses_by_user(user_id, %Pagination{} = pagination, %Filters{} = filters) do
    base_query =
      from(e in Expense, where: e.user_id == ^user_id, order_by: [desc: e.inserted_at])
      |> apply_filters(filters)

    amount_total = Repo.aggregate(base_query, :sum, :value) || Decimal.new(0)

    base_query
    |> Repo.paginate(pagination)
    |> Map.put(:amount_total, amount_total)
  end

  defp apply_filters(query, %Filters{category: category, search: search, month: month}) do
    query
    |> maybe_filter_category(category)
    |> maybe_filter_search(search)
    |> maybe_filter_month(month)
  end

  defp maybe_filter_category(query, nil), do: query

  defp maybe_filter_category(query, category) do
    from(e in query, where: e.category == ^category)
  end

  defp maybe_filter_search(query, nil), do: query

  defp maybe_filter_search(query, search) do
    pattern = "%#{search}%"
    from(e in query, where: ilike(e.description, ^pattern))
  end

  defp maybe_filter_month(query, nil), do: query

  defp maybe_filter_month(query, month_str) do
    [year_str, month_str] = String.split(month_str, "-")
    {year, _} = Integer.parse(year_str)
    {month, _} = Integer.parse(month_str)

    start_dt = DateTime.new!(Date.new!(year, month, 1), ~T[00:00:00], "Etc/UTC")

    {next_year, next_month} = if month == 12, do: {year + 1, 1}, else: {year, month + 1}
    end_dt = DateTime.new!(Date.new!(next_year, next_month, 1), ~T[00:00:00], "Etc/UTC")

    from(e in query, where: e.inserted_at >= ^start_dt and e.inserted_at < ^end_dt)
  end
end
