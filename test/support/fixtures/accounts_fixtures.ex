defmodule Anotagasto.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Anotagasto.Accounts` context.
  """

  @doc """
  Generate a user.
  """
  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> Enum.into(%{
        name: "some name",
        password: "some password",
        phone_number: "some phone_number"
      })
      |> Anotagasto.Accounts.create_user()

    user
  end
end
