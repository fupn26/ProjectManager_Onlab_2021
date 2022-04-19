using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ToDoAPI.Cache;
using ToDoAPI.Controllers.DTO;
using ToDoAPI.Models;
using ToDoAPI.Repositories;

namespace ToDoAPI.Controllers
{
    [Route("api/v1/todo")]
    [ApiController]
    public class ToDoController : ControllerBase
    {
        private readonly IToDoRepository _repository;
        private readonly IToDoCache _toDoCache;

        public ToDoController(IToDoRepository repository, IToDoCache toDoCache)
        {
            _repository = repository;
            _toDoCache = toDoCache;
        }

        [HttpPost]
        public async Task<ActionResult<ToDo>> Create(ToDoCreateDto toDoToCreate)
        {
            var toDo = new ToDo
            {
                ProjectId = toDoToCreate.ProjectId,
                Title = toDoToCreate.Title,
                Description = toDoToCreate.Description,
                AssigneeIds = toDoToCreate.Assignees ?? new List<string>(),
                Status = EToDoStatus.TODO
            };

            try
            {
                await _repository.Create(toDo);

            }
            catch (MongoWriteException e)
            {
                return BadRequest(e.Message);
            }

            return CreatedAtRoute("GetToDo", new { id = toDo.Id.ToString() }, toDo);
        }

        [HttpGet("{id:length(24)}", Name = "GetToDo")]
        public async Task<ActionResult<ToDo>> GetById(string id)
        {
            var toDo = await _toDoCache.GetCachedToDo(id);
            if (toDo != null)
                return toDo;
            else
            {
                toDo = await _repository.Get(id);

                if (toDo == null)
                {
                    return NotFound();
                }

                await _toDoCache.Add(toDo);
                return toDo;
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<ToDo>>> Get([FromQuery] string projectId)
        {
            List<ToDo> toDos;

            if (projectId == null)
            {
                toDos = (await _repository.Get()).ToList();
            }
            else
            {
                toDos = (await _repository.GetByProjectId(projectId)).ToList();
            }

            foreach (var item in toDos)
            {
                await _toDoCache.Add(item);
            }

            return toDos;
        }

        [HttpPatch("{id:length(24)}/status/todo")]
        public async Task<IActionResult> ChangeStatusToToDo(string id)
        {
            var toDo = await _repository.Get(id);

            if (toDo == null)
            {
                return NotFound("ToDo with " + id + " not found");
            }

            toDo.Status = EToDoStatus.TODO;
            await _repository.Update(toDo);
            await _toDoCache.Invalidate(toDo.Id.ToString());

            return Ok();
        }

        [HttpPatch("{id:length(24)}/status/doing")]
        public async Task<IActionResult> ChangeStatusToDoing(string id)
        {
            var toDo = await _repository.Get(id);

            if (toDo == null)
            {
                return NotFound("ToDo with " + id + " not found");
            }

            toDo.Status = EToDoStatus.DOING;
            await _repository.Update(toDo);
            await _toDoCache.Invalidate(toDo.Id.ToString());

            return Ok();
        }

        [HttpPatch("{id:length(24)}/status/done")]
        public async Task<IActionResult> ChangeStatusToDone(string id)
        {
            var toDo = await _repository.Get(id);

            if (toDo == null)
            {
                return NotFound("ToDo with " + id + " not found");
            }

            toDo.Status = EToDoStatus.DONE;
            await _repository.Update(toDo);
            await _toDoCache.Invalidate(toDo.Id.ToString());

            return Ok();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var toDo = await _repository.Get(id);

            if (toDo == null)
            {
                return NotFound("ToDo with " + id + " not found");
            }

            await _repository.Delete(id);
            await _toDoCache.Invalidate(toDo.Id.ToString());

            return Ok();
        }
    }
}
