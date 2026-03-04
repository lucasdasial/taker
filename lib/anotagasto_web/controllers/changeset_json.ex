defmodule AnotagastoWeb.ChangesetJSON do
  @doc """
  Renders changeset errors.
  """
  def error(%{changeset: changeset}) do
    # When encoded, the changeset returns its errors
    # as a JSON object. So we just pass it forward.
    %{errors: Ecto.Changeset.traverse_errors(changeset, &translate_error/1)}
  end

  defp translate_error({msg, opts}) do
    if count = opts[:count] do
      Gettext.dngettext(AnotagastoWeb.Gettext, "errors", msg, msg, count, opts)
    else
      Gettext.dgettext(AnotagastoWeb.Gettext, "errors", msg, opts)
    end
  end
end
