#!/bin/bash
# github-relationships.sh
# Wraps GitHub's GraphQL API for managing native sub-issue and dependency relationships.
#
# Usage:
#   github-relationships.sh <command> [options]
#
# Commands:
#   add-sub-issue      --parent <num> --child <num>    Add child as sub-issue of parent
#   remove-sub-issue   --parent <num> --child <num>    Remove sub-issue relationship
#   list-sub-issues    <issue_num>                     List sub-issues of an issue
#   get-parent         <issue_num>                     Get parent of an issue
#   completion-summary <issue_num>                     Get sub-issue completion stats
#   add-blocked-by     --issue <num> --blocked-by <num>  Mark issue as blocked
#   remove-blocked-by  --issue <num> --blocked-by <num>  Remove blocking relationship
#   list-blocked-by    <issue_num>                     List issues blocking this one
#   list-blocking      <issue_num>                     List issues this one blocks
#
# Environment:
#   GITHUB_OWNER  Override detected owner
#   GITHUB_REPO   Override detected repo
#
# Exit codes:
#   0 - Success
#   1 - Usage/argument error
#   2 - API error (issue not found, permission denied, etc.)

set -euo pipefail

# --- Repo Detection ---

detect_owner_repo() {
  if [[ -n "${GITHUB_OWNER:-}" && -n "${GITHUB_REPO:-}" ]]; then
    return
  fi

  local remote_url
  remote_url=$(git remote get-url origin 2>/dev/null) || {
    echo "Error: Not in a git repository or no origin remote" >&2
    exit 1
  }

  # Handle both HTTPS and SSH URLs
  if [[ "$remote_url" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
    GITHUB_OWNER="${GITHUB_OWNER:-${BASH_REMATCH[1]}}"
    GITHUB_REPO="${GITHUB_REPO:-${BASH_REMATCH[2]}}"
  else
    echo "Error: Could not parse owner/repo from remote URL: $remote_url" >&2
    exit 1
  fi
}

# --- GraphQL Helpers ---

get_issue_node_id() {
  local issue_num=$1
  local result
  result=$(gh api graphql -f query="
    query {
      repository(owner: \"$GITHUB_OWNER\", name: \"$GITHUB_REPO\") {
        issue(number: $issue_num) { id }
      }
    }
  " --jq '.data.repository.issue.id' 2>&1) || {
    echo "Error: Could not find issue #$issue_num" >&2
    exit 2
  }

  if [[ -z "$result" || "$result" == "null" ]]; then
    echo "Error: Issue #$issue_num not found in $GITHUB_OWNER/$GITHUB_REPO" >&2
    exit 2
  fi

  echo "$result"
}

run_graphql() {
  local query=$1
  local result
  result=$(gh api graphql -f query="$query" 2>&1) || {
    echo "Error: GraphQL request failed: $result" >&2
    exit 2
  }

  # Check for GraphQL errors
  if echo "$result" | grep -q '"errors"'; then
    local error_msg
    error_msg=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['errors'][0]['message'])" 2>/dev/null || echo "$result")
    echo "Error: $error_msg" >&2
    exit 2
  fi

  echo "$result"
}

# --- Sub-Issue Commands ---

cmd_add_sub_issue() {
  local parent_num="" child_num=""

  while [[ $# -gt 0 ]]; do
    case $1 in
      --parent) parent_num="$2"; shift 2 ;;
      --child) child_num="$2"; shift 2 ;;
      *) echo "Error: Unknown option: $1" >&2; exit 1 ;;
    esac
  done

  if [[ -z "$parent_num" || -z "$child_num" ]]; then
    echo "Usage: github-relationships.sh add-sub-issue --parent <num> --child <num>" >&2
    exit 1
  fi

  local parent_id child_id
  parent_id=$(get_issue_node_id "$parent_num")
  child_id=$(get_issue_node_id "$child_num")

  run_graphql "
    mutation {
      addSubIssue(input: { issueId: \"$parent_id\", subIssueId: \"$child_id\" }) {
        issue { number }
        subIssue { number }
      }
    }
  " > /dev/null

  echo "Linked #$child_num as sub-issue of #$parent_num"
}

cmd_remove_sub_issue() {
  local parent_num="" child_num=""

  while [[ $# -gt 0 ]]; do
    case $1 in
      --parent) parent_num="$2"; shift 2 ;;
      --child) child_num="$2"; shift 2 ;;
      *) echo "Error: Unknown option: $1" >&2; exit 1 ;;
    esac
  done

  if [[ -z "$parent_num" || -z "$child_num" ]]; then
    echo "Usage: github-relationships.sh remove-sub-issue --parent <num> --child <num>" >&2
    exit 1
  fi

  local parent_id child_id
  parent_id=$(get_issue_node_id "$parent_num")
  child_id=$(get_issue_node_id "$child_num")

  run_graphql "
    mutation {
      removeSubIssue(input: { issueId: \"$parent_id\", subIssueId: \"$child_id\" }) {
        issue { number }
        subIssue { number }
      }
    }
  " > /dev/null

  echo "Removed #$child_num as sub-issue of #$parent_num"
}

cmd_list_sub_issues() {
  local issue_num=$1

  local result
  result=$(run_graphql "
    query {
      repository(owner: \"$GITHUB_OWNER\", name: \"$GITHUB_REPO\") {
        issue(number: $issue_num) {
          subIssues(first: 50) {
            nodes { number title state }
          }
        }
      }
    }
  ")

  echo "$result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
nodes = data['data']['repository']['issue']['subIssues']['nodes']
for node in nodes:
    state = 'open' if node['state'] == 'OPEN' else 'closed'
    print(f\"#{node['number']} [{state}] {node['title']}\")
if not nodes:
    sys.exit(0)
"
}

cmd_get_parent() {
  local issue_num=$1

  local result
  result=$(run_graphql "
    query {
      repository(owner: \"$GITHUB_OWNER\", name: \"$GITHUB_REPO\") {
        issue(number: $issue_num) {
          parent { number title }
        }
      }
    }
  ")

  local parent
  parent=$(echo "$result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
parent = data['data']['repository']['issue']['parent']
if parent:
    print(f\"#{parent['number']} {parent['title']}\")
" 2>/dev/null)

  if [[ -n "$parent" ]]; then
    echo "$parent"
  fi
}

cmd_completion_summary() {
  local issue_num=$1

  local result
  result=$(run_graphql "
    query {
      repository(owner: \"$GITHUB_OWNER\", name: \"$GITHUB_REPO\") {
        issue(number: $issue_num) {
          subIssuesSummary { total completed percentCompleted }
        }
      }
    }
  ")

  echo "$result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
summary = data['data']['repository']['issue']['subIssuesSummary']
print(f\"total={summary['total']} completed={summary['completed']} percent={summary['percentCompleted']}\")
"
}

# --- Dependency Commands ---

cmd_add_blocked_by() {
  local issue_num="" blocked_by_num=""

  while [[ $# -gt 0 ]]; do
    case $1 in
      --issue) issue_num="$2"; shift 2 ;;
      --blocked-by) blocked_by_num="$2"; shift 2 ;;
      *) echo "Error: Unknown option: $1" >&2; exit 1 ;;
    esac
  done

  if [[ -z "$issue_num" || -z "$blocked_by_num" ]]; then
    echo "Usage: github-relationships.sh add-blocked-by --issue <num> --blocked-by <num>" >&2
    exit 1
  fi

  local issue_id blocker_id
  issue_id=$(get_issue_node_id "$issue_num")
  blocker_id=$(get_issue_node_id "$blocked_by_num")

  run_graphql "
    mutation {
      addBlockedBy(input: { issueId: \"$issue_id\", blockingIssueId: \"$blocker_id\" }) {
        issue { number }
        blockingIssue { number }
      }
    }
  " > /dev/null

  echo "#$issue_num is now blocked by #$blocked_by_num"
}

cmd_remove_blocked_by() {
  local issue_num="" blocked_by_num=""

  while [[ $# -gt 0 ]]; do
    case $1 in
      --issue) issue_num="$2"; shift 2 ;;
      --blocked-by) blocked_by_num="$2"; shift 2 ;;
      *) echo "Error: Unknown option: $1" >&2; exit 1 ;;
    esac
  done

  if [[ -z "$issue_num" || -z "$blocked_by_num" ]]; then
    echo "Usage: github-relationships.sh remove-blocked-by --issue <num> --blocked-by <num>" >&2
    exit 1
  fi

  local issue_id blocker_id
  issue_id=$(get_issue_node_id "$issue_num")
  blocker_id=$(get_issue_node_id "$blocked_by_num")

  run_graphql "
    mutation {
      removeBlockedBy(input: { issueId: \"$issue_id\", blockingIssueId: \"$blocker_id\" }) {
        issue { number }
        blockingIssue { number }
      }
    }
  " > /dev/null

  echo "Removed: #$issue_num no longer blocked by #$blocked_by_num"
}

cmd_list_blocked_by() {
  local issue_num=$1

  local result
  result=$(run_graphql "
    query {
      repository(owner: \"$GITHUB_OWNER\", name: \"$GITHUB_REPO\") {
        issue(number: $issue_num) {
          blockedBy(first: 50) {
            nodes { number title state }
          }
        }
      }
    }
  ")

  echo "$result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
nodes = data['data']['repository']['issue']['blockedBy']['nodes']
for node in nodes:
    state = 'open' if node['state'] == 'OPEN' else 'closed'
    print(f\"#{node['number']} [{state}] {node['title']}\")
"
}

cmd_list_blocking() {
  local issue_num=$1

  local result
  result=$(run_graphql "
    query {
      repository(owner: \"$GITHUB_OWNER\", name: \"$GITHUB_REPO\") {
        issue(number: $issue_num) {
          blocking(first: 50) {
            nodes { number title state }
          }
        }
      }
    }
  ")

  echo "$result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
nodes = data['data']['repository']['issue']['blocking']['nodes']
for node in nodes:
    state = 'open' if node['state'] == 'OPEN' else 'closed'
    print(f\"#{node['number']} [{state}] {node['title']}\")
"
}

# --- Main ---

usage() {
  cat <<'USAGE'
Usage: github-relationships.sh <command> [options]

Commands:
  add-sub-issue      --parent <num> --child <num>
  remove-sub-issue   --parent <num> --child <num>
  list-sub-issues    <issue_num>
  get-parent         <issue_num>
  completion-summary <issue_num>
  add-blocked-by     --issue <num> --blocked-by <num>
  remove-blocked-by  --issue <num> --blocked-by <num>
  list-blocked-by    <issue_num>
  list-blocking      <issue_num>

Environment:
  GITHUB_OWNER  Override detected owner
  GITHUB_REPO   Override detected repo
USAGE
  exit 1
}

if [[ $# -lt 1 ]]; then
  usage
fi

COMMAND=$1
shift

detect_owner_repo

case "$COMMAND" in
  add-sub-issue)      cmd_add_sub_issue "$@" ;;
  remove-sub-issue)   cmd_remove_sub_issue "$@" ;;
  list-sub-issues)    cmd_list_sub_issues "$@" ;;
  get-parent)         cmd_get_parent "$@" ;;
  completion-summary) cmd_completion_summary "$@" ;;
  add-blocked-by)     cmd_add_blocked_by "$@" ;;
  remove-blocked-by)  cmd_remove_blocked_by "$@" ;;
  list-blocked-by)    cmd_list_blocked_by "$@" ;;
  list-blocking)      cmd_list_blocking "$@" ;;
  *)                  echo "Error: Unknown command: $COMMAND" >&2; usage ;;
esac
