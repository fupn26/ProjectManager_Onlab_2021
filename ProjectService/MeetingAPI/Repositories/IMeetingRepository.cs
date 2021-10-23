using MeetingAPI.Models;
using MongoDAL.Repositories;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MeetingAPI.Repositories
{
    public interface IMeetingRepository : IBaseRepository<Meeting>
    {
        Task<UpdateResult> UpdateTheme(string id, string newTheme);
        Task<UpdateResult> UpdateDate(string id, DateTime newStartTime, DateTime newEndTime);
        Task<UpdateResult> UpdatePlace(string id, string newPlace);
        Task<UpdateResult> UpdateNotes(string id, string newNotes);
        Task<UpdateResult> UpdateParticipants(string id, List<string> participants);
    }
}
