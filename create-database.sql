/*
	Script to create database on the Docker SQL Server
*/

create database bss_stats
go

use bss_stats
go

create schema upl authorization dbo
go

create login bss_nodejs_app with password=N'bss_nodejs_app',
	default_database=bss_stats,
	default_language=[British],
	check_expiration=OFF,
	check_policy=OFF
go


create user bss_nodejs_app for login bss_nodejs_app with default_schema=[upl]
go

grant exec, select, insert, update, delete on schema :: upl to bss_nodejs_app;

create table upl.Workbooks (
	id int identity(1,1),
	adddate datetime not null default (getdate()),
	spreadsheet_key varchar(60) null,
	topic_id int null,
	forum_id int null,
	parent_id int null,
	topic_time datetime null,
	topic_title varchar(255) null,
	topic_first_poster_name varchar(100) null

	constraint PK_upl_workbooks primary key (id)
);

create table upl.DuplicateWorkbooks (
	id int identity(1,1),
	adddate datetime not null default (getdate()),
	spreadsheet_key varchar(60) null,
	topic_id int null,
	forum_id int null,
	parent_id int null,
	topic_time datetime null,
	topic_title varchar(255) null,
	topic_first_poster_name varchar(100) null

	constraint PK_upl_duplicateworkbooks primary key (id)
);

create table upl.Worksheets (
	id int identity(1,1),
	workbook_id int not null,
	worksheet_title varchar(100) not null,

	constraint PK_upl_worksheets primary key (id),
	constraint FK_upl_worksheetsworkbook foreign key(workbook_id) references upl.Workbooks(id)
);
create table upl.CellsFeed (
	workbook_id int null,
	worksheet_id int null,
	rowid smallint null,
	colid smallint null,
	cellvalue varchar(255) null
);
create table upl.Forums (
	id int not null,
	parent_id int null,
	forum_name varchar(255) null,
	event_id tinyint null,
	season_id tinyint null,

	constraint PK_upl_forums primary key(id)
);

insert upl.Forums(id, parent_id, forum_name, event_id, season_id)
values 
	(197,9,'Chaos Cup',22,0),
	(198,9,'World Championships',11,0),
	(199,9,'4TT',5,0),
	(200,9,'BLRC',4,0),
	(201,9,'Pairs',8,0),
	(202,9,'KO Cup',2,0),
	(259,179,'Completed Matches/Season 12',1,12),
	(264,9,'Grand Prix',24,0),
	(266,9,'5TT',23,0),
	(272,179,'Completed Matches/Season 13',1,13),
	(277,179,'Completed Matches/Season 14',1,14);
go

create procedure [upl].[getWorkbookId]
	@spreadsheet_key varchar(40)
	, @topic_id int
	, @forum_id int
	, @parent_id int
	, @topic_time datetime
	, @topic_title varchar(255)
	, @topic_first_poster_name varchar(100)
as

set nocount on;

if 0 = (select count(*) from upl.Workbooks (nolock) where spreadsheet_key = @spreadsheet_key)
  begin
	--Does not exist.  Add it and let the calling app know that upload is needed
	insert upl.Workbooks (
		spreadsheet_key
		, topic_id
		, forum_id
		, parent_id
		, topic_time
		, topic_title
		, topic_first_poster_name
	)
	values (
		@spreadsheet_key
		, @topic_id
		, @forum_id
		, @parent_id
		, @topic_time
		, @topic_title
		, @topic_first_poster_name
	);

	select @@IDENTITY as workbook_id, 'ADD' as app_action;
  end
else
  begin
	--Exists.  Let the calling app know so that upload can be skipped
	insert upl.DuplicateWorkbooks (
		spreadsheet_key
		, topic_id
		, forum_id
		, parent_id
		, topic_time
		, topic_title
		, topic_first_poster_name
	)
	values (
		@spreadsheet_key
		, @topic_id
		, @forum_id
		, @parent_id
		, @topic_time
		, @topic_title
		, @topic_first_poster_name
	);

	select 0 as workbook_id, 'IGNORE' as app_action;
  end
go

create procedure [upl].[getWorksheetId]
	@workbook_id int
	, @worksheet_title varchar(100)
as

if 0 = (select count(*) from upl.Worksheets (nolock) where workbook_id = @workbook_id and worksheet_title = @worksheet_title)
  begin
	--Does not exist.  Add it and let the calling app know that upload is needed
	insert upl.Worksheets (
		workbook_id
		, worksheet_title
	)
	values (
		@workbook_id
		, @worksheet_title
	);

	select @@IDENTITY as worksheet_id, 'ADD' as app_action;
  end
else
  begin
	--Exists.  Let the calling app know so that upload can be skipped
	select 0 as worksheet_id, 'IGNORE' as app_action;
  end

go

create procedure [upl].[getTopicId]
as

set nocount on;

if 0 = (select count(*) from upl.Workbooks (nolock))
	select 0 as topic_id;
else
	select max(topic_id) as topic_id
	from (
		select max(topic_id) as topic_id from upl.Workbooks (nolock)
		union all
		select max(topic_id) from upl.DuplicateWorkbooks (nolock)
	) as x;

go