def _make_project(client):
    resp = client.post("/projects", json={"name": "Issue Test Project"})
    return resp.json()["id"]


def test_create_issue_requires_valid_status(client):
    project_id = _make_project(client)
    resp = client.post(
        f"/projects/{project_id}/issues",
        json={"title": "Bad status", "status": "not_real"},
    )
    assert resp.status_code == 422


def test_full_issue_lifecycle(client):
    project_id = _make_project(client)

    created = client.post(
        f"/projects/{project_id}/issues",
        json={"title": "Do the thing", "status": "backlog", "priority": "medium"},
    )
    assert created.status_code == 201
    issue_id = created.json()["id"]

    patched = client.patch(f"/issues/{issue_id}", json={"status": "in_progress"})
    assert patched.status_code == 200
    assert patched.json()["status"] == "in_progress"

    deleted = client.delete(f"/issues/{issue_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/issues/{issue_id}")
    assert missing.status_code == 404


def test_filter_by_status(client):
    project_id = _make_project(client)
    client.post(f"/projects/{project_id}/issues", json={"title": "A", "status": "done"})
    client.post(f"/projects/{project_id}/issues", json={"title": "B", "status": "backlog"})

    resp = client.get(f"/projects/{project_id}/issues", params={"status": "done"})
    assert resp.status_code == 200
    titles = [i["title"] for i in resp.json()]
    assert titles == ["A"]


def test_issues_for_unknown_project_404(client):
    resp = client.get("/projects/999999/issues")
    assert resp.status_code == 404
