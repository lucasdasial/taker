defmodule Anotagasto.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    field :password, :string
    field :phone_number, :string

    timestamps(type: :utc_datetime)
  end

  def changeset(attrs), do: changeset(%__MODULE__{}, attrs)
  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :password, :phone_number])
    |> validate_required([:name, :password, :phone_number])
  end
end
