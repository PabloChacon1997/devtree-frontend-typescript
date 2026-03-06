import { useEffect, useState, type ChangeEvent } from "react"
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { social } from "../data/social"
import DevTreeInput from "../components/DevTreeInput";
import { isValidUrl } from "../utils";
import { updateProfile } from "../api/DevtreeApi";
import type { SocialNetwork, User } from "../types";

export const LinkTreeView = () => {
  const [devtreeLinks, setDevtreeLinks] = useState(social);

  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(['user'])!;

  const { mutate } = useMutation({
    mutationFn: updateProfile,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Actualizado correctamente');
    }
  })

  useEffect(() => {
    const updateLinks = devtreeLinks.map(item => {
      const userLink = JSON.parse(user.links).find((link: SocialNetwork) => link.name === item.name);
      if (userLink) {
        return {...item, url: userLink.url, enabled: userLink.enabled}
      }
      return item;
    })
    setDevtreeLinks(updateLinks);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const updatedLinks = devtreeLinks.map(link => link.name === e.target.name ? { ...link, url: e.target.value } :link);
    setDevtreeLinks(updatedLinks);
  }
  const links: SocialNetwork[] = JSON.parse(user.links);

  const handleEnabledLink = (socialNetwork: string) => {
    const updatedLinks = devtreeLinks.map(link => {
      if(link.name === socialNetwork) {
        if (isValidUrl(link.url)) {
          return { ...link, enabled: !link.enabled }
        } else {
          toast.error('La URL es inválida')
        }
      }
      return link;
    });
    setDevtreeLinks(updatedLinks);
    let updatedItems: SocialNetwork[] = [];
    const selectSocialnetwork = updatedLinks.find(link => link.name === socialNetwork);
    if(selectSocialnetwork?.enabled) {
      const id = links.filter(link => link.id).length +1;
      if (links.some(link => link.name === socialNetwork)) {
        updatedItems = links.map(link => {
          if (link.name === socialNetwork) {
            return {
              ...link,
              enabled: true,
              id
            }
          } else {
            return link
          }
        })
      } else {
        const newItem = {
          ...selectSocialnetwork,
          id,
        }
  
        updatedItems = [...links, newItem]
      }
    } else {
      const indexToUpdate = links.findIndex(link => link.name === socialNetwork);
      updatedItems = links.map(link => {
        if (link.name === socialNetwork) {
          return {
            ...link,
            id: 0,
            enabled: false,
          }
        } else if(link.id > indexToUpdate && (indexToUpdate !== 0 && link.id === 1)) {
          return {
            ...link,
            id: link.id - 1,
          }
        } else {
          return link;
        }
      });
    }

    queryClient.setQueryData(['user'], (prevState: User) => {
      return {
        ...prevState,
        links: JSON.stringify(updatedItems),
      }
    });
  }

  return (
    <div className="space-y-5">
      {
        devtreeLinks.map(item => (
          <DevTreeInput 
            key={item.name}
            item={item}
            handleUrlChange={handleUrlChange}
            handleEnabledLink={handleEnabledLink}
          />
        ))
      }
      <button 
        className="bg-cyan-400 p-2 text-lg w-full uppercase text-slate-600 rounded-lg font-bold"
        onClick={() => mutate(queryClient.getQueryData(['user'])!)}
      >
        Guardar cambios
      </button>
    </div>
  )
}
