defmodule Anotagasto.Expenses.Analytics do
  import Ecto.Query

  alias Anotagasto.Expenses.Analytics.Params
  alias Anotagasto.Expenses.Expense
  alias Anotagasto.Repo

  def summary(user_id, params) do
    with {:ok, %Params{} = p} <- Params.build(params) do
      {start_dt, end_dt} = Params.date_range(p)

      rows =
        from(e in Expense,
          where:
            e.user_id == ^user_id and
              e.inserted_at >= ^start_dt and
              e.inserted_at < ^end_dt,
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
end
