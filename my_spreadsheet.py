from __future__ import print_function
from apiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools

# Setup the Sheets API


def setup_spreadsheet():
    SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'
    store = file.Storage('credentials.json')
    creds = store.get()
    if not creds or creds.invalid:
        flow = client.flow_from_clientsecrets('client_secret.json', SCOPES)
        args = tools.argparser.parse_args()
        args.noauth_local_webserver = True
        creds = tools.run_flow(flow, store, args)
    service = build('sheets', 'v4', http=creds.authorize(Http()))
    return service

# Call the Sheets API


def is_load_spreadsheet(email, SPREADSHEET_ID):
    RANGE_NAME = 'B2:B'
    result = setup_spreadsheet().spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID, range=RANGE_NAME).execute()
    values = result.get('values', [])
    if not values:
        return False
    else:
        for row in values:
            if row:
                if row[0] == email:
                    return True
    return False


setup_spreadsheet()
