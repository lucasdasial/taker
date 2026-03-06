defmodule Anotagasto.Expenses.Analytics do
  import Ecto.Query

  alias Anotagasto.Expenses.Analytics.Params
  alias Anotagasto.Expenses.Expense
  alias Anotagasto.Repo

  def daily(user_id, params) do
    with {:ok, %Params{} = p} <- Params.build(params) do
      {start_date, end_date} = date_range(p)

      days =
        from(e in Expense,
          where:
            e.user_id == ^user_id and
              e.date >= ^start_date and
              e.date < ^end_date,
          group_by: e.date,
          select: {e.date, sum(e.value), count(e.id)},
          order_by: e.date
        )
        |> Repo.all()
        |> Enum.map(fn {date, total, count} -> %{date: date, total: total, count: count} end)

      {:ok, %{month: p.month, days: days}}
    end
  end

  def summary(user_id, params) do
    with {:ok, %Params{} = p} <- Params.build(params) do
      {start_date, end_date} = date_range(p)

      rows =
        from(e in Expense,
          where:
            e.user_id == ^user_id and
              e.date >= ^start_date and
              e.date < ^end_date,
          group_by: e.category,
          select: {e.category, sum(e.value), count(e.id)},
          order_by: [desc: sum(e.value)]
        )
        |> Repo.all()

      by_category =
        Enum.map(rows, fn {cat, total, count} ->
          %{category: cat, total: total, count: count}
        end)

      total = Enum.reduce(by_category, Decimal.new(0), &Decimal.add(&2, &1.total))
      count = Enum.reduce(by_category, 0, &(&2 + &1.count))

      {:ok, %{month: p.month, total: total, count: count, by_category: by_category}}
    end
  end

  defp date_range(%Params{month: month_str}) do
    [year_str, month_num_str] = String.split(month_str, "-")
    {year, _} = Integer.parse(year_str)
    {month, _} = Integer.parse(month_num_str)
    {next_year, next_month} = if month == 12, do: {year + 1, 1}, else: {year, month + 1}

    {Date.new!(year, month, 1), Date.new!(next_year, next_month, 1)}
  end
end
