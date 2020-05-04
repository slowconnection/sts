# sts
Speedway Turbo Sliders Statistics

Still very much work in progress but the following features work;
1) pulls meeting posts in JSON format from the BSS forum; maximum of 10 every 5 minutes to stay within the confines of Google API.
2) pulls the cells feed from the Google API
3) populates the Workbook, Worksheet and CellsFeed tables in the SQL Server 2019 database.


SQL
- moved from local install to a Docker image (on 4th May).  
- at present this database as the "upl" schema objects.


Next steps
- Flesh out all new templates (~600 data points for each :/ )
- Pull the member list in JSON format to keep the rider list up to date
- start to map out how the meetings will be processed moving forwards.
  - re-use the existing structure (tables, view and stored procedures)?
  - build a new refined model and enforce stronger referential integrity.
  - automate as far as is possible with minimal/zero dependency upon user input.
  Old version needed the meetings to be scaffolded in advance.  Hopefully the 
  available data negates this (forum_id and parent_id should indicate the event.  
  date of meeting should indicate the season.  stronger validation checks should 
  identify the correct template.  etc).
  - determine how problematic meetings will be handled.  Process everything linear
  then stall when stumbling block (e.g. unidentified rider) hit?
  
  Will need a user interface for a few things;
  - season set-up (start date, end date, how many league teams?, squad size, team size, etc
  - addressing any non-matches
  
  
Final steps
- Pushing data to the MySQL database.  I could persist with the remote linked server approach
but ideally switch to HTTP post (of JSON?).  Perhaps another NodeJS application?
