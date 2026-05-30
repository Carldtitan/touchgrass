// Auth screen control presence + validation routing (Req 1.1, 1.5, 1.7, 2.5).
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RepositoriesProvider } from "../../hooks/RepositoriesProvider";
import { AuthProvider } from "../../hooks/AuthProvider";
import { createInMemoryRepositories } from "../../data/inMemory";
import { AuthScreen } from "./AuthScreen";
import { LABELS } from "../../contracts/labels";

function renderAuth() {
  const repos = createInMemoryRepositories();
  return render(
    <RepositoriesProvider repositories={repos}>
      <AuthProvider>
        <AuthScreen />
      </AuthProvider>
    </RepositoriesProvider>,
  );
}

describe("AuthScreen", () => {
  it("shows both Sign up and Log in controls (Req 1.1)", () => {
    renderAuth();
    expect(screen.getAllByText(LABELS.signUp).length).toBeGreaterThan(0);
    expect(screen.getAllByText(LABELS.logIn).length).toBeGreaterThan(0);
  });

  it("blocks sign up with an invalid email and names the field (Req 1.7)", async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.type(screen.getByLabelText("Display name"), "Ada");
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "REDACTED");
    await user.click(screen.getByRole("button", { name: LABELS.signUp }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it("blocks sign up with a short password (Req 1.8)", async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.type(screen.getByLabelText("Display name"), "Ada");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: LABELS.signUp }));
    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});
