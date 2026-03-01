defmodule Anotagasto.Expenses.Analytics.Params do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false

  embedded_schema do
    field :month, :string
  end

  def build(params) do
    params = Map.put_new(params, "month", current_month())

    %__MODULE__{}
    |> cast(params, [:month])
    |> validate_format(:month, ~r/^\d{4}-\d{2}$/, message: "must be in YYYY-MM format")
    |> validate_month_exists()
    |> apply_action(:validate)
  end

  def date_range(%__MODULE__{month: month_str}) do
    [year_str, month_num_str] = String.split(month_str, "-")
    {year, _} = Integer.parse(year_str)
    {month, _} = Integer.parse(month_num_str)

    start_dt = DateTime.new!(Date.new!(year, month, 1), ~T[00:00:00], "Etc/UTC")
    {next_year, next_month} = if month == 12, do: {year + 1, 1}, else: {year, month + 1}
    end_dt = DateTime.new!(Date.new!(next_year, next_month, 1), ~T[00:00:00], "Etc/UTC")

    {start_dt, end_dt}
  end

  defp validate_month_exists(changeset) do
    case get_change(changeset, :month) do
      nil ->
        changeset

      month_str ->
        case String.split(month_str, "-") do
          [year_str, month_num_str] ->
            with {year, ""} <- Integer.parse(year_str),
                 {month, ""} <- Integer.parse(month_num_str),
                 {:ok, _} <- Date.new(year, month, 1) do
              changeset
            else
              _ -> add_error(changeset, :month, "is not a valid month")
            end

          _ ->
            changeset
        end
    end
  end

  defp current_month, do: Calendar.strftime(DateTime.utc_now(), "%Y-%m")
end
