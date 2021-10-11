using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using ProjectAPI.Controllers.DTO;
using ProjectAPI.Models;
using ProjectAPI.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAPI.Controllers
{
    [Route("api/v1/todo")]
    [ApiController]
    public class ToDoController : ControllerBase
    {
        private readonly ITodoRepository _repository;

        public ToDoController(ITodoRepository repository)
        {
            _repository = repository;
        }

        [HttpPost]
        public async Task<ActionResult<ToDo>> Create(ToDoCreateDto toDoToCreate)
        {
            var toDo = new ToDo
            {
                ProjectId = toDoToCreate.ProjectId,
                Title = toDoToCreate.Title,
                Desctiption = toDoToCreate.Description,
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
        public async Task<ActionResult<ToDo>> Get(string id)
        {
            var toDo = await _repository.Get(id);

            if (toDo == null)
            {
                return NotFound();
            }

            return toDo;
        }

        [HttpGet]
        public async Task<ActionResult<List<ToDo>>> Get()
        {
            var result = await _repository.Get();
            return result.ToList();
        }

        [HttpPut("to-do/{id:length(24)}")]
        public async Task<IActionResult> ChangeStatusToToDo(string id)
        {
            var toDo = await _repository.Get(id);

            if (toDo == null)
            {
                return NotFound("ToDo with " + id + " not found");
            }

            toDo.Status = EToDoStatus.TODO;
            await _repository.Update(toDo);

            return Ok();
        }

        [HttpPut("doing/{id:length(24)}")]
        public async Task<IActionResult> ChangeStatusToDoing(string id)
        {
            var toDo = await _repository.Get(id);

            if (toDo == null)
            {
                return NotFound("ToDo with " + id + " not found");
            }

            toDo.Status = EToDoStatus.DOING;
            await _repository.Update(toDo);

            return Ok();
        }

        [HttpPut("done/{id:length(24)}")]
        public async Task<IActionResult> ChangeStatusToDone(string id)
        {
            var toDo = await _repository.Get(id);

            if (toDo == null)
            {
                return NotFound("ToDo with " + id + " not found");
            }

            toDo.Status = EToDoStatus.DONE;
            await _repository.Update(toDo);

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

            return Ok();
        }
    }
}
