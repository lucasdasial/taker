defmodule Anotagasto.Expenses.Filters do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false

  @category_enum [
    :food,
    :eat_out,
    :cleaning_products,
    :health,
    :housing,
    :subscriptions,
    :transport,
    :education,
    :shopping,
    :debts,
    :leisure,
    :beauty,
    :uncategorized
  ]

  embedded_schema do
    field :search, :string
    field :category, Ecto.Enum, values: @category_enum
    field :month, :string
  end

  def build(params) do
    %__MODULE__{}
    |> cast(params, [:search, :category, :month])
    |> normalize_search()
    |> validate_month_format()
    |> apply_action(:validate)
  end

  defp normalize_search(changeset) do
    case get_change(changeset, :search) do
      nil -> changeset
      "" -> delete_change(changeset, :search)
      search -> put_change(changeset, :search, String.trim(search))
    end
  end

  defp validate_month_format(changeset) do
    changeset
    |> validate_format(:month, ~r/^\d{4}-\d{2}$/, message: "must be in YYYY-MM format")
    |> validate_month_date()
  end

  defp validate_month_date(changeset) do
    case get_change(changeset, :month) do
      nil ->
        changeset

      month_str ->
        [year_str, month_str] = String.split(month_str, "-")
        {year, _} = Integer.parse(year_str)
        {month, _} = Integer.parse(month_str)

        case Date.new(year, month, 1) do
          {:ok, _} -> changeset
          {:error, _} -> add_error(changeset, :month, "is not a valid month")
        end
    end
  end
end
