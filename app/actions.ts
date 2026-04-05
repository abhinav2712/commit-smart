"use server";

type TeamEnergy = "startup" | "enterprise" | "chaos";

type CommitVibes = {
  conventional: string;
  descriptive: string;
  funny: string;
};

type DiffSummary = {
  files: string[];
  additions: number;
  deletions: number;
  changedLines: number;
  changeType: "feat" | "fix" | "refactor" | "docs" | "chore" | "test";
  subject: string;
  scope: string;
};

const MAX_DIFF_LENGTH = 40_000;

export async function generateCommitMessages(
  diff: string,
  teamEnergy: TeamEnergy = "startup",
): Promise<CommitVibes> {
  const normalizedDiff = diff.trim();

  if (!normalizedDiff) {
    throw new Error("Paste a git diff before generating commit vibes.");
  }

  if (normalizedDiff.length > MAX_DIFF_LENGTH) {
    throw new Error("That diff is too large. Try a smaller paste or split it into chunks.");
  }

  if (!looksLikeDiff(normalizedDiff)) {
    throw new Error(
      "This does not look like a git diff. Include lines such as diff --git, +++/---, or +/- hunks.",
    );
  }

  const summary = summarizeDiff(normalizedDiff);

  const provider = process.env.LLM_PROVIDER?.toLowerCase() ?? "mock";

  if (provider === "openai") {
    return runOpenAIAnalysis(normalizedDiff, teamEnergy, summary);
  }

  if (provider === "anthropic") {
    return runAnthropicAnalysis(normalizedDiff, teamEnergy, summary);
  }

  return buildMockCommitVibes(summary, teamEnergy);
}

function looksLikeDiff(diff: string) {
  return (
    diff.includes("diff --git") ||
    diff.includes("+++ ") ||
    diff.includes("--- ") ||
    /^[-+]{1,2}\s/m.test(diff) ||
    /^@@/m.test(diff)
  );
}

function summarizeDiff(diff: string): DiffSummary {
  const lines = diff.split(/\r?\n/);
  const files = new Set<string>();
  let additions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith("+++ b/") || line.startsWith("--- a/")) {
      files.add(line.slice(6).trim());
      continue;
    }

    if (line.startsWith("diff --git ")) {
      const parts = line.split(" ");
      const file = parts.at(-1);
      if (file && file !== "/dev/null") {
        files.add(file.replace(/^b\//, ""));
      }
      continue;
    }

    if (line.startsWith("+") && !line.startsWith("+++")) {
      additions += 1;
    }

    if (line.startsWith("-") && !line.startsWith("---")) {
      deletions += 1;
    }
  }

  const changedLines = additions + deletions;
  const fileList = [...files];
  const firstFile = fileList[0] ?? "repo";
  const scope = firstFile.includes("/") ? firstFile.split("/")[0] : firstFile.replace(/\..*$/, "");
  const changeType = inferChangeType(diff, additions, deletions);
  const subject = inferSubject(changeType, fileList, additions, deletions);

  return {
    files: fileList,
    additions,
    deletions,
    changedLines,
    changeType,
    subject,
    scope,
  };
}

function inferChangeType(
  diff: string,
  additions: number,
  deletions: number,
): DiffSummary["changeType"] {
  const lower = diff.toLowerCase();

  if (lower.includes("test") || lower.includes("spec")) {
    return "test";
  }

  if (lower.includes("readme") || lower.includes(".md")) {
    return "docs";
  }

  if (lower.includes("refactor") || (additions > 40 && deletions > 40)) {
    return "refactor";
  }

  if (lower.includes("fix") || deletions > additions) {
    return "fix";
  }

  if (lower.includes("chore") || lower.includes("deps") || lower.includes("config")) {
    return "chore";
  }

  return "feat";
}

function inferSubject(
  changeType: DiffSummary["changeType"],
  files: string[],
  additions: number,
  deletions: number,
) {
  const fileSubject = files[0]
    ? files[0]
        .replace(/^src\//, "")
        .replace(/^app\//, "")
        .replace(/\.[^.]+$/, "")
        .replace(/[\\/]+/g, " ")
    : "git changes";

  const changes = `${additions} insertions, ${deletions} deletions`;

  switch (changeType) {
    case "docs":
      return `document ${fileSubject}`;
    case "test":
      return `improve ${fileSubject} coverage`;
    case "refactor":
      return `simplify ${fileSubject}`;
    case "fix":
      return `fix ${fileSubject}`;
    case "chore":
      return `update ${fileSubject}`;
    default:
      return `${fileSubject} with ${changes}`;
  }
}

function buildMockCommitVibes(
  summary: DiffSummary,
  teamEnergy: TeamEnergy,
): CommitVibes {
  const tone =
    teamEnergy === "enterprise"
      ? "measured"
      : teamEnergy === "chaos"
        ? "unhinged"
        : "fast-moving";
  const descriptiveType = summary.changeType === "feat" ? "Feature" : capitalize(summary.changeType);

  const conventional = `${summary.changeType}${summary.scope ? `(${summary.scope})` : ""}: ${summary.subject}`;

  const descriptive = [
    `${descriptiveType} update touching ${summary.files.length || 1} file${summary.files.length === 1 ? "" : "s"}.`,
    `Net change: ${summary.additions} additions and ${summary.deletions} deletions across ${summary.changedLines} edited lines.`,
    `Primary area: ${summary.files[0] ?? "repo root"}; tone: ${tone}.`,
  ].join(" ");

  const funny =
    teamEnergy === "enterprise"
      ? `Performed a highly governed rearrangement of ${summary.files[0] ?? "the codebase"} so the auditors can sleep tonight.`
      : teamEnergy === "chaos"
        ? `We wrestled ${summary.changedLines} lines into submission and asked Git to please stop making this our personality.`
        : `Gave ${summary.files[0] ?? "the codebase"} a much-needed caffeine shot and sent it back into the sprint.`;

  return {
    conventional,
    descriptive,
    funny,
  };
}

async function runOpenAIAnalysis(
  diff: string,
  teamEnergy: TeamEnergy,
  summary: DiffSummary,
): Promise<CommitVibes> {
  const prompt = buildPrompt(diff, teamEnergy, summary);

  // Swap this mock payload for the OpenAI SDK call you prefer.
  // Example shape:
  // const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const response = await client.responses.create({ model: "gpt-4.1-mini", input: prompt });
  // return parseResponse(response.output_text);
  void prompt;

  return buildMockCommitVibes(summary, teamEnergy);
}

async function runAnthropicAnalysis(
  diff: string,
  teamEnergy: TeamEnergy,
  summary: DiffSummary,
): Promise<CommitVibes> {
  const prompt = buildPrompt(diff, teamEnergy, summary);

  // Swap this mock payload for the Anthropic SDK call you prefer.
  // Example shape:
  // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  // const response = await client.messages.create({ model: "claude-3-5-sonnet-latest", messages: [...] });
  // return parseResponse(response.content);
  void prompt;

  return buildMockCommitVibes(summary, teamEnergy);
}

function buildPrompt(diff: string, teamEnergy: TeamEnergy, summary: DiffSummary) {
  return {
    system:
      "You are a commit-message generator that returns strict JSON with conventional, descriptive, and funny keys.",
    user: {
      diff,
      teamEnergy,
      summary,
      requirements: [
        "Return valid JSON only.",
        "Keep conventional commit Angular-style and concise.",
        "Make descriptive informative and detailed.",
        "Make funny witty, playful, or sarcastic, depending on tone.",
      ],
    },
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
