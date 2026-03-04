defmodule Anotagasto.Repo.Migrations.CreateExpenses do
  use Ecto.Migration

  def change do
    create table(:expenses, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :value, :integer, null: false
      add :description, :string, null: false
      add :category, :string, null: false

      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create index(:expenses, [:user_id])
    create index(:expenses, [:user_id, :inserted_at])
    create index(:expenses, [:user_id, :category])
  end
end
