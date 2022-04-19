using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ToDoAPI.Models;

namespace ToDoAPI.Cache
{
    public interface IToDoCache
    {
        Task<ToDo> GetCachedToDo(string toDoId);
        Task Add(ToDo toDoToAdd);
        Task Invalidate(string toDoId);
    }
}
