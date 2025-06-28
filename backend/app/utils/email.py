from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Personalization, Email
from sendgrid import SendGridException  # Import the specific exception
from app.core.config import settings


def send_email(to_emails: list, subject: str, content: str) -> None:
    """
    Send an email using SendGrid.

    Args:
        to_emails (list): List of recipient email addresses
        subject (str): Email subject
        content (str): Email body content (HTML)
        unsubscribe_url (str, optional): URL for unsubscribe link (for update emails)

    Raises:
        SendGridException: If email sending fails
    """
    message = Mail(
        from_email=Email("info@grindsheet.xyz", "GrindSheet"),
        subject=subject,
        html_content=content,
    )

    personalization = Personalization()
    for email in to_emails:
        print(f"Adding email: {email}, type: {type(email)}")
        if not isinstance(email, str) or not email:
            print(f"Invalid email: {email}")
            raise ValueError(f"Invalid email address: {email}")
        try:
            personalization.add_to(Email(email))  # Use Email object
        except Exception as e:
            print(f"Error in add_to for email {email}: {e}")
            raise

    message.add_personalization(personalization)

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        print(sg)
        response = sg.send(message)
        print(f"Email sent: {response.status_code}")
    except SendGridException as e:
        print(f"Error sending email: {e}")
        if hasattr(e, "body"):
            print(f"SendGrid error body: {e.body}")  # type: ignore
        raise
    except Exception as e:
        print(f"Unexpected error sending email: {e}")
        raise
