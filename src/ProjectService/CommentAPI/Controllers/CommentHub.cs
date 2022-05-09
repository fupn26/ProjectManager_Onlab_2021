using CommentAPI.Controllers.DTO;
using CommentAPI.Models;
using CommentAPI.Repositories;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CommentAPI.Controllers
{
    public class CommentHub : Hub
    {
        private readonly ILogger _logger;

        public CommentHub(ILogger<CommentHub> logger)
        {
            _logger = logger;
        }

        public override Task OnConnectedAsync()
        {
            _logger.LogInformation($"Connected: {Context.ConnectionId}");
            return base.OnConnectedAsync();
        }

        public async Task SendMessage()
        {
            await NotifyClients();
        }

        private async Task NotifyClients()
        {
            await Clients.Others.SendAsync("ReceiveMessage");
        }
    }
}
