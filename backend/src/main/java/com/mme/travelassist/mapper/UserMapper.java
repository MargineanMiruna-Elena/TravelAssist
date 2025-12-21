package com.mme.travelassist.mapper;

import com.mme.travelassist.dto.user.UpdateUserResponseDTO;
import com.mme.travelassist.dto.user.UserDTO;
import com.mme.travelassist.dto.user.UserResponseDTO;
import com.mme.travelassist.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Converts a User entity to a UserResponseDTO.
     *
     * @param user the User entity to convert
     * @return the converted UserResponseDTO
     */
    UserResponseDTO userToUserResponseDTO(User user);

    /**
     * Converts a UserDTO to a User entity.
     *
     * @param userDTO the UserDTO to convert
     * @return the converted User entity
     */
    User userDTOToUser(UserDTO userDTO);

    /**
     * Converts a User to a UpdateUserResponseDTO entity.
     *
     * @param user the User to convert
     * @return the converted UpdateUserResponseDTO entity
     */
    UpdateUserResponseDTO userToUpdateUserResponseDTO(User user);
}
