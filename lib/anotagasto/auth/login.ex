defmodule Anotagasto.Auth.Login do
  use Ecto.Schema

  import Ecto.Changeset
  alias Anotagasto.Auth.Login

  @primary_key false
  embedded_schema do
    field :phone_number, :string
    field :password, :string
  end

  def changeset(attrs), do: changeset(%__MODULE__{}, attrs)
  @doc false
  def changeset(%Login{} = login, attrs) do
    login
    |> cast(attrs, [:phone_number, :password])
    |> validate_required([:phone_number, :password])
  end

  def valid?(attrs) do
    attrs
    |> changeset()
    |> Ecto.Changeset.apply_action(:validate)
  end
end
