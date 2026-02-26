from django import template

register = template.Library()

@register.filter
def filter_status(consultations, status):
    return [c for c in consultations if c.status == status]