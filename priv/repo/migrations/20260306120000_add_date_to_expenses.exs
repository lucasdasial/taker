defmodule Anotagasto.Repo.Migrations.AddDateToExpenses do
  use Ecto.Migration

  def up do
    alter table(:expenses) do
      add :date, :date, null: true
    end

    execute "UPDATE expenses SET date = inserted_at::date"

    alter table(:expenses) do
      modify :date, :date, null: false, default: fragment("CURRENT_DATE")
    end

    create index(:expenses, [:user_id, :date])
  end

  def down do
    drop index(:expenses, [:user_id, :date])

    alter table(:expenses) do
      remove :date
    end
  end
end
