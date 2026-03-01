defmodule AnotagastoWeb.AnalyticsJSON do
  def summary(%{month: month, total: total, count: count, by_category: by_category}) do
    %{
      data: %{
        month: month,
        total: total,
        count: count,
        by_category:
          Enum.map(by_category, fn entry ->
            %{category: entry.category, total: entry.total, count: entry.count}
          end)
      }
    }
  end
end
