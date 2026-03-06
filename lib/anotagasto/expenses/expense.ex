defmodule Anotagasto.Expenses.Expense do
  use Ecto.Schema
  import Ecto.Changeset

  @category_enum [
    :grocery,
    :eat_out,
    :cleaning_products,
    :health,
    :medicines,
    :housing,
    :subscriptions,
    :transport_public,
    :transport_apps,
    :education,
    :shopping,
    :debts,
    :leisure,
    :beauty,
    :clothing,
    :delivery,
    :vehicle,
    :uncategorized
  ]

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "expenses" do
    field :value, :integer
    field :description, :string
    field :category, Ecto.Enum, values: @category_enum
    field :date, :date

    belongs_to :user, Anotagasto.Accounts.User

    timestamps(type: :utc_datetime)
  end

  def changeset(attrs), do: changeset(%__MODULE__{}, attrs)
  @doc false
  def changeset(expense, attrs) do
    expense
    |> cast(attrs, [:value, :description, :category, :date, :user_id])
    |> validate_required([:value, :description, :category, :user_id])
    |> put_date_default()
  end

  defp put_date_default(changeset) do
    if get_field(changeset, :date) do
      changeset
    else
      put_change(changeset, :date, Date.utc_today())
    end
  end

  def valid?(attrs) do
    attrs
    |> changeset()
    |> Ecto.Changeset.apply_action(:validate)
  end
end
