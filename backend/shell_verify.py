from apps.projects.models import WorkRequest, Project
from apps.clients.models import Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.projects.views import WorkRequestViewSet

User = get_user_model()

def test_negotiation_flow():
    # 1. Setup users
    freelancer = User.objects.filter(role='FREELANCER').first()
    client_user = User.objects.filter(role='CLIENT').first()
    
    if not freelancer or not client_user:
        print("Required users not found.")
        return

    # 2. Create a WorkRequest
    # Remove existing one if name match to keep it clean
    WorkRequest.objects.filter(title="Negotiation Test").delete()
    
    wr = WorkRequest.objects.create(
        freelancer=freelancer,
        client=client_user,
        title="Negotiation Test",
        description="Testing the new flow",
        deadline="2026-05-01",
        status='PENDING'
    )
    print(f"Created WorkRequest: {wr.id}")

    factory = APIRequestFactory()
    view = WorkRequestViewSet.as_view({'post': 'accept'})

    # 3. Freelancer Proposes
    request = factory.post(f'/api/projects/work-requests/{wr.id}/accept/', {
        'budget': 7500,
        'deadline': '2026-06-01'
    })
    force_authenticate(request, user=freelancer)
    response = view(request, pk=wr.id)
    
    wr.refresh_from_db()
    print(f"Freelancer Proposal Response: {response.status_code}")
    print(f"WorkRequest Status: {wr.status}, Budget: {wr.budget}, Deadline: {wr.deadline}")

    # 4. Client Accepts
    view_client = WorkRequestViewSet.as_view({'post': 'client_accept'})
    request_client = factory.post(f'/api/projects/work-requests/{wr.id}/client_accept/')
    force_authenticate(request_client, user=client_user)
    response_client = view_client(request_client, pk=wr.id)

    wr.refresh_from_db()
    print(f"Client Acceptance Response: {response_client.status_code}")
    print(f"WorkRequest Final Status: {wr.status}")

    # 5. Check Project
    project = Project.objects.filter(title="Negotiation Test", freelancer=freelancer).first()
    if project:
        print(f"Project Created: {project.id}, Status: {project.status}, Budget: {project.budget}")
    else:
        print("Project NOT created!")

test_negotiation_flow()
