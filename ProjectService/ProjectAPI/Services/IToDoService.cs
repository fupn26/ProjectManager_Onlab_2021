using ProjectAPI.Models;
using System.Collections.Generic;

namespace ProjectAPI.Services
{
    interface IToDoService
    {
        void CreateToDo(ToDo toDoToCreate);
        void DeleteToDo(string toDoId);
        void AddComment(string toDoId, CommentEmbedded comment);
        void UpdateComment(string toDoId, int commentId, string newContent);
        void DeleteComment(string toDoId, string commentId);
        IEnumerable<ToDo> GetAllForProject(string projectId);
        IEnumerable<ToDo> GetAllForUser(string userId);
        ToDo GetById(string toDoId);
        void SetToDoStatusToToDo(string toDoId);
        void SetToDoStatusToDoing(string toDoId);
        void SetToDoStatusToDone(string toDoId);
    }
}
