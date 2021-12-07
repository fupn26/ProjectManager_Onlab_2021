using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Newtonsoft.Json;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

        public ToDoController(IToDoRepository repository)
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
                Description = toDoToCreate.Description,
                AssigneeIds = toDoToCreate.Assignees ?? new List<string>(),
                Status = EToDoStatus.TODO
            };

            try
            {
                await _repository.Create(toDo);
                sendTaskCreatedMessage(toDo);

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
            var toDo = await _repository.Get(id);

            if (toDo == null)
            {
                return NotFound();
            }

            return toDo;
        }

        [HttpGet]
        public async Task<ActionResult<List<ToDo>>> Get([FromQuery] string projectId)
        {
            if (projectId == null)
            {
                var result = await _repository.Get();
                return result.ToList();
            }
            else
            {
                var toDos = await _repository.GetByProjectId(projectId);
                return toDos.ToList();
            }
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

        private void sendTaskCreatedMessage(ToDo toDoToSend)
        {
            var factory = new ConnectionFactory() { HostName = "localhost" };
            using (var connection = factory.CreateConnection())
            using (var channel = connection.CreateModel())
            {
                channel.QueueDeclare(queue: "hello",
                                     durable: false,
                                     exclusive: false,
                                     autoDelete: false,
                                     arguments: null);

                string message = JsonConvert.SerializeObject(toDoToSend);
                var body = Encoding.UTF8.GetBytes(message);

                channel.BasicPublish(exchange: "",
                                     routingKey: "hello",
                                     basicProperties: null,
                                     body: body);
                Console.WriteLine(" [x] Sent {0}", message);
            }
        }
    }
}
