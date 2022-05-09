package main

import "time"

const (
	CREATED         int = 0
	TITLE_UPDATED       = 1
	MEMBER_ADDED        = 2
	MEMEBER_DELETED     = 3
)

type ProjectActivity struct {
	ProjectTitle string
	UserId       string
	MemberIds    []string
	ActivityType int
}

type MeetingActivity struct {
	Theme          string
	StartTime      time.Time
	EndTime        time.Time
	Place          string
	ParticipantIds []string
}

type CommentActivity struct {
	TaskId    string
	CreatorId string
	Content   string
}

type TaskActivity struct {
	ProjectId   string
	Title       string
	Status      string
	AssigneeIds []string
}

type User struct {
	Name  string
	Email string
}

type UserDto struct {
	Id    string `json:"id""`
	Name  string `json:"username"`
	Email string `json:"email"`
}
