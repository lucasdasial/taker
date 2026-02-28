defmodule Anotagasto.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :name, :string
      add :password, :string
      add :phone_number, :string

      timestamps(type: :utc_datetime)
    end
  end
end
