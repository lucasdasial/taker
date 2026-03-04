defmodule Anotagasto.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "users" do
    field :name, :string
    field :password, :string
    field :phone_number, :string

    has_many :expenses, Anotagasto.Expenses.Expense

    timestamps(type: :utc_datetime)
  end

  def changeset(attrs), do: changeset(%__MODULE__{}, attrs)
  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :password, :phone_number])
    |> validate_required([:name, :password, :phone_number])
    |> sanitize_phone_number()
    |> unique_constraint(:phone_number)
    |> hash_password()
  end

  defp sanitize_phone_number(changeset) do
    update_change(changeset, :phone_number, &Regex.replace(~r/[^\d]/, &1, ""))
  end

  defp hash_password(%Ecto.Changeset{} = changeset) do
    password_hashed =
      changeset
      |> get_field(:password)
      |> Bcrypt.hash_pwd_salt()

    put_change(changeset, :password, password_hashed)
  end
end
