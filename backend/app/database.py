"""
Database singleton.
Prevents circular imports when routers need to access Prisma.
"""

from prisma import Prisma

db = Prisma()
